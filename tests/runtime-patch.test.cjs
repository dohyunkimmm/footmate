const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../footmate-core.js');

const bases = {
  suwon:{avgElo:1299,regionKey:'suwon',timeKey:'morning',positions:['MF','FW'],distanceKm:1.2,formats:['5vs5'],dateKey:'sat'},
  seongnam:{avgElo:1320,regionKey:'seongnam',timeKey:'day',positions:['MF','DF'],distanceKm:0.8,formats:['5vs5','7vs7'],dateKey:'sun'},
  yongin:{avgElo:1278,regionKey:'seongnam',timeKey:'evening',positions:['FW','DF'],distanceKm:2.4,formats:['5vs5','7vs7'],dateKey:'sat'}
};

test('updated ELO becomes the effective ELO for the next recommendation', () => {
  assert.equal(core.effectiveElo({initialElo:1295,currentElo:1311}),1311);
});

test('middle skill is distinct from beginner', () => {
  assert.equal(core.skillLabel(1),'초급');
  assert.equal(core.skillLabel(1.5),'중급');
});

test('hard filters exclude mismatched date/region/time/distance/format/position', () => {
  const profile={region:'seongnam',time:'day',distanceKm:1,format:'7vs7',position:'MF',dateKey:'sun',matchSkill:2};
  const ranked=core.rankMatches(bases,profile,{currentElo:1295});
  assert.equal(ranked[0].key,'seongnam');
  assert.equal(ranked[0].eligible,true);
  assert.equal(ranked.filter(x=>x.eligible).length,1);
});

test('recommendations are sorted by eligibility then score', () => {
  const profile={region:'suwon',time:'morning',distanceKm:15,format:'5vs5',position:'MF',dateKey:'sat',matchSkill:2};
  const ranked=core.rankMatches(bases,profile,{currentElo:1295});
  assert.equal(ranked[0].key,'suwon');
  assert.equal(ranked[0].eligible,true);
});

test('data quality does not report traceability PASS before all funnel events exist', () => {
  const status=core.dataQualityStatus({answeredCount:0,eventCount:0,valid:true,consistent:false});
  assert.equal(status.completeness,'CHECK');
  assert.equal(status.traceability,'CHECK');
  const complete=core.dataQualityStatus({answeredCount:5,eventCount:5,valid:true,consistent:true});
  assert.equal(complete.traceability,'PASS');
});
