import assert from 'node:assert/strict';
import {matchingAssessment,rankRecommendations} from '../../src/platform/domain/recommendation.js';
import {MATCHES,createState} from '../../src/app/data.js';

for(const match of MATCHES){
  for(const position of ['GK','DF','MF','FW']){
    const state=createState({region:match.region,level:match.level,position});
    const result=matchingAssessment(match,state);
    assert.ok(result.strengths.includes('선호 지역 일치'));
    assert.ok(result.strengths.includes('설정한 경기 강도 일치'));
    if(Number(match.positionSlots?.[position]||0)>0){assert.ok(result.strengths.includes(`${position} 참가 가능`));assert.ok(!result.cautions.includes(`${position} 자리 마감`));}
    else assert.ok(result.cautions.includes(`${position} 자리 마감`));
  }
}
const state=createState({region:'서울 · 강남',position:'GK',level:'입문'});
const rows=rankRecommendations(MATCHES,state);
for(let i=1;i<rows.length;i++)assert.ok(rows[i-1].fitTier<=rows[i].fitTier);
for(const row of rows){const a=matchingAssessment(row.match,state);if(row.match.region!==state.region)assert.ok(a.cautions.includes('선호 지역 밖의 대안'));}
console.log('PASS player-to-match facts and suitability tiers across catalog/positions');
