(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FootMateProductCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const stateMachines = Object.freeze({
    payment: Object.freeze({
      idle: ['pending'],
      pending: ['paid', 'failed'],
      failed: ['pending'],
      paid: ['refunded'],
      refunded: []
    }),
    participation: Object.freeze({
      available: ['waitlisted', 'confirmed'],
      waitlisted: ['offered', 'cancelled'],
      offered: ['confirmed', 'cancelled', 'expired'],
      confirmed: ['checked_in', 'cancelled', 'no_show'],
      checked_in: ['completed'],
      completed: [],
      cancelled: [],
      expired: [],
      no_show: []
    }),
    match: Object.freeze({
      open: ['full', 'cancelled', 'completed'],
      full: ['open', 'cancelled'],
      cancelled: [],
      completed: []
    })
  });

  const eligibilityLabels = Object.freeze({
    date: '선택 날짜',
    region: '선택 지역',
    time: '선호 시간대',
    distance: '이동 거리',
    format: '경기 방식',
    position: '모집 포지션'
  });

  const kpiDefinitions = Object.freeze([
    { key: 'recommendation_ctr', label: '추천 클릭률', numerator: 'match_detail_open', denominator: 'recommendation_results_view' },
    { key: 'payment_conversion', label: '신청 전환율', numerator: 'payment_complete', denominator: 'match_detail_open' },
    { key: 'no_show_rate', label: '노쇼율', numerator: 'participation_no_show', denominator: 'payment_complete', inverse: true },
    { key: 'rematch_intent', label: '재참여 의향', numerator: 'rematch_click', denominator: 'result_submit' }
  ]);

  function machineFor(name) {
    return stateMachines[name] || null;
  }

  function allowedTransitions(machine, state) {
    const definition = machineFor(machine);
    if (!definition) return [];
    return Array.isArray(definition[state]) ? definition[state].slice() : [];
  }

  function canTransition(machine, from, to) {
    return allowedTransitions(machine, from).includes(to);
  }

  function transitionState(machine, from, to) {
    const definition = machineFor(machine);
    if (!definition) return { ok: false, machine, from, to, state: from, reason: 'unknown_machine' };
    if (!(from in definition)) return { ok: false, machine, from, to, state: from, reason: 'unknown_state' };
    if (!canTransition(machine, from, to)) return { ok: false, machine, from, to, state: from, reason: 'transition_not_allowed' };
    return { ok: true, machine, from, to, state: to, reason: null };
  }

  function factorScore(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : fallback;
  }

  function explainMatch(scored) {
    const match = scored || {};
    const eligibility = match.eligibility || {};
    const factors = [
      { key: 'elo', label: 'ELO 적합도', score: factorScore(match.eloScore, 0), pass: true },
      { key: 'distance', label: '거리 적합도', score: factorScore(match.locationScore, eligibility.distance === false ? 0 : 100), pass: eligibility.distance !== false },
      { key: 'time', label: '시간대', score: eligibility.time === false ? 0 : 100, pass: eligibility.time !== false },
      { key: 'position', label: '포지션', score: eligibility.position === false ? 0 : 100, pass: eligibility.position !== false },
      { key: 'format', label: '경기 방식', score: eligibility.format === false ? 0 : 100, pass: eligibility.format !== false },
      { key: 'date', label: '날짜', score: eligibility.date === false ? 0 : 100, pass: eligibility.date !== false },
      { key: 'region', label: '지역', score: eligibility.region === false ? 0 : 100, pass: eligibility.region !== false }
    ];
    const exclusions = Object.entries(eligibility)
      .filter(([, pass]) => pass === false)
      .map(([key]) => ({ key, label: eligibilityLabels[key] || key, message: `${eligibilityLabels[key] || key} 조건 불일치` }));
    const reasons = factors
      .filter(factor => factor.pass && factor.score >= 75)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(factor => `${factor.label} ${factor.score}점`);
    const relaxPriority = exclusions.map(item => item.key);
    return {
      eligible: match.eligible !== false && exclusions.length === 0,
      pct: factorScore(match.pct, 0),
      factors,
      reasons,
      exclusions,
      fallback: exclusions.length ? {
        action: 'relax_filters',
        message: '조건을 완화하면 후보를 다시 찾을 수 있습니다.',
        relaxPriority
      } : null
    };
  }

  function compareRecommendations(before, after) {
    const a = explainMatch(before);
    const b = explainMatch(after);
    const beforeMap = Object.fromEntries(a.factors.map(item => [item.key, item.score]));
    const factors = b.factors.map(item => ({
      key: item.key,
      label: item.label,
      before: beforeMap[item.key] ?? null,
      after: item.score,
      delta: beforeMap[item.key] == null ? null : item.score - beforeMap[item.key]
    }));
    return {
      beforePct: a.pct,
      afterPct: b.pct,
      pctDelta: b.pct - a.pct,
      eligibilityChanged: a.eligible !== b.eligible,
      factors
    };
  }

  function normalizeAnalyticsEvent(name, metadata, context) {
    const ctx = context || {};
    return {
      name: String(name || '').trim(),
      timestamp: ctx.timestamp || new Date().toISOString(),
      sessionId: String(ctx.sessionId || 'demo-session'),
      version: String(ctx.version || '1.0'),
      metadata: metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? Object.assign({}, metadata) : {}
    };
  }

  function validateAnalyticsEvent(event) {
    const issues = [];
    if (!event || typeof event !== 'object') return { pass: false, issues: ['event_object_missing'] };
    if (!String(event.name || '').trim()) issues.push('name_missing');
    if (!event.timestamp || Number.isNaN(Date.parse(event.timestamp))) issues.push('timestamp_invalid');
    if (!String(event.sessionId || '').trim()) issues.push('session_id_missing');
    if (!String(event.version || '').trim()) issues.push('version_missing');
    if (!event.metadata || typeof event.metadata !== 'object' || Array.isArray(event.metadata)) issues.push('metadata_invalid');
    return { pass: issues.length === 0, issues };
  }

  function eventName(event) {
    return typeof event === 'string' ? event : event && event.name;
  }

  function funnelMetrics(events, funnel) {
    const required = Array.isArray(funnel) && funnel.length ? funnel : [];
    const names = Array.isArray(events) ? events.map(eventName).filter(Boolean) : [];
    let cursor = -1;
    const steps = required.map(name => {
      const index = names.indexOf(name, cursor + 1);
      const reached = index >= 0;
      if (reached) cursor = index;
      return { name, reached, index };
    });
    const completedCount = steps.filter(step => step.reached).length;
    return {
      steps,
      completedCount,
      requiredCount: required.length,
      conversionPct: required.length ? Math.round((completedCount / required.length) * 100) : 0,
      complete: completedCount === required.length,
      nextMissing: steps.find(step => !step.reached)?.name || null
    };
  }

  function countEvents(events) {
    const counts = {};
    for (const event of Array.isArray(events) ? events : []) {
      const name = eventName(event);
      if (name) counts[name] = (counts[name] || 0) + 1;
    }
    return counts;
  }

  function kpiSnapshot(events) {
    const counts = countEvents(events);
    return kpiDefinitions.map(definition => {
      const numerator = counts[definition.numerator] || 0;
      const denominator = counts[definition.denominator] || 0;
      const rate = denominator ? Math.round((numerator / denominator) * 100) : null;
      return Object.assign({}, definition, { numeratorCount: numerator, denominatorCount: denominator, rate });
    });
  }

  return {
    stateMachines,
    allowedTransitions,
    canTransition,
    transitionState,
    explainMatch,
    compareRecommendations,
    normalizeAnalyticsEvent,
    validateAnalyticsEvent,
    funnelMetrics,
    kpiDefinitions: kpiDefinitions.map(item => Object.assign({}, item)),
    kpiSnapshot
  };
});
