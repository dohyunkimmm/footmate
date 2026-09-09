(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FootMateCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const skillLabels = new Map([
    [0, '입문'], [1, '초급'], [1.5, '중급'], [2, '중상급'], [3, '상급']
  ]);
  const skillTargets = new Map([
    [0, 1050], [1, 1160], [1.5, 1235], [2, 1300], [3, 1425]
  ]);
  const defaultFunnel = [
    'quiz_complete',
    'recommendation_results_view',
    'match_detail_open',
    'payment_complete',
    'result_submit'
  ];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function effectiveElo(state) {
    const current = Number(state && state.currentElo);
    if (Number.isFinite(current)) return current;
    const initial = Number(state && state.initialElo);
    return Number.isFinite(initial) ? initial : 1200;
  }

  function skillLabel(value) {
    return skillLabels.get(Number(value)) || '중상급';
  }

  function sameDateKey(profileKey, baseKey) {
    if (!profileKey || !baseKey) return true;
    return String(profileKey) === String(baseKey);
  }

  function scoreMatch(base, profile, state, weights) {
    const currentElo = effectiveElo(state);
    const maxDistance = Math.max(1, Number(profile.distanceKm) || 15);
    const requestedFormat = profile.format || '5vs5';
    const requestedSkill = Number.isFinite(Number(profile.matchSkill)) ? Number(profile.matchSkill) : Number(profile.skill);
    const targetElo = skillTargets.get(requestedSkill) || currentElo;
    const formats = Array.isArray(base.formats) && base.formats.length ? base.formats : [base.format || '5vs5'];
    const positions = Array.isArray(base.positions) ? base.positions : [];
    const distanceKm = Number(base.distanceKm ?? parseFloat(base.distance)) || 999;

    const eligibility = {
      date: sameDateKey(profile.dateKey, base.dateKey),
      region: !profile.region || base.regionKey === profile.region,
      time: !profile.time || base.timeKey === profile.time,
      distance: distanceKm <= maxDistance,
      format: formats.includes(requestedFormat),
      position: !profile.position || positions.includes(profile.position)
    };
    const eligible = Object.values(eligibility).every(Boolean);

    const eloDiff = Math.abs(currentElo - Number(base.avgElo));
    const targetDiff = Math.abs(targetElo - Number(base.avgElo));
    const userEloScore = clamp(Math.round(100 - eloDiff * 0.22), 45, 99);
    const targetSkillScore = clamp(Math.round(100 - targetDiff * 0.12), 55, 99);
    const eloScore = Math.round(userEloScore * 0.8 + targetSkillScore * 0.2);
    const styleScore = clamp(72 + (profile.time === base.timeKey ? 14 : 0) + (positions.includes(profile.position) ? 10 : 0), 55, 99);
    const distanceScore = clamp(Math.round(100 - (distanceKm / maxDistance) * 28), 58, 99);
    const w = weights || { elo: 0.5, style: 0.3, location: 0.2 };
    const pct = Math.round(eloScore * w.elo + styleScore * w.style + distanceScore * w.location);

    return Object.assign({}, base, {
      eligible,
      eligibility,
      pct,
      eloScore,
      styleScore,
      locationScore: distanceScore,
      eloDiff,
      currentElo,
      requestedFormat,
      requestedSkill,
      distanceKm
    });
  }

  function rankMatches(bases, profile, state, weights) {
    return Object.entries(bases)
      .map(([key, base]) => Object.assign({ key }, scoreMatch(base, profile, state, weights)))
      .sort((a, b) => {
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
        if (b.pct !== a.pct) return b.pct - a.pct;
        return a.distanceKm - b.distanceKm;
      });
  }

  function eventName(event) {
    return typeof event === 'string' ? event : event && event.name;
  }

  function eventTraceStatus(events, requiredEvents) {
    const required = Array.isArray(requiredEvents) && requiredEvents.length ? requiredEvents : defaultFunnel;
    const names = Array.isArray(events) ? events.map(eventName).filter(Boolean) : [];
    let cursor = -1;
    const missing = [];
    for (const name of required) {
      const index = names.indexOf(name, cursor + 1);
      if (index < 0) missing.push(name);
      else cursor = index;
    }
    return {
      pass: missing.length === 0,
      completeCount: required.length - missing.length,
      requiredCount: required.length,
      missing,
      names
    };
  }

  function consistencyStatus(checks) {
    if (typeof checks === 'boolean') return checks;
    if (!checks || typeof checks !== 'object') return false;
    const values = Object.values(checks);
    return values.length > 0 && values.every(Boolean);
  }

  function filterHomeMatches(matches, filters) {
    const list = Array.isArray(matches) ? matches : [];
    const f = filters || {};
    const currentElo = Number(f.currentElo);
    return list.filter(match => {
      if (Array.isArray(f.keys) && !f.keys.includes(match.key)) return false;
      if (f.openOnly && match.status && match.status !== 'open') return false;
      if (Number.isFinite(Number(f.maxEloDiff)) && Number.isFinite(currentElo) && Math.abs(Number(match.avgElo) - currentElo) > Number(f.maxEloDiff)) return false;
      if (Number.isFinite(Number(f.maxDistanceKm)) && Number(match.distanceKm) > Number(f.maxDistanceKm)) return false;
      return true;
    });
  }

  function applyCredit(balance, delta) {
    const current = Number(balance);
    const change = Number(delta);
    if (!Number.isFinite(current) || !Number.isFinite(change)) return 0;
    return Math.max(0, Math.round(current + change));
  }

  function dataQualityStatus(input) {
    const answered = Number(input.answeredCount) || 0;
    const valid = Boolean(input.valid);
    const consistent = input.consistencyChecks !== undefined ? consistencyStatus(input.consistencyChecks) : Boolean(input.consistent);
    const trace = Array.isArray(input.events)
      ? eventTraceStatus(input.events, input.requiredEvents)
      : { pass: (Number(input.eventCount) || 0) >= 5 };
    return {
      completeness: answered >= 5 ? 'PASS' : 'CHECK',
      validity: valid ? 'PASS' : 'CHECK',
      freshness: 'SAMPLE',
      consistency: consistent ? 'PASS' : 'CHECK',
      traceability: trace.pass ? 'PASS' : 'CHECK'
    };
  }

  return {
    clamp,
    effectiveElo,
    skillLabel,
    scoreMatch,
    rankMatches,
    eventTraceStatus,
    consistencyStatus,
    filterHomeMatches,
    applyCredit,
    dataQualityStatus,
    defaultFunnel: defaultFunnel.slice()
  };
});
