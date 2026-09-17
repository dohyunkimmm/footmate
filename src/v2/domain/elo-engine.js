export function createEloEngine({kFactor=32}={}){
  function actualScore(result){
    return result==='WIN'?1:result==='DRAW'?.5:0;
  }

  function calculate({baseElo,opponentElo,result}){
    const base=Number(baseElo);
    const opponent=Number(opponentElo);
    const safeBase=Number.isFinite(base)?base:1200;
    const safeOpponent=Number.isFinite(opponent)?opponent:safeBase;
    const expected=1/(1+Math.pow(10,(safeOpponent-safeBase)/400));
    const actual=actualScore(result);
    const delta=Math.round(Number(kFactor)*(actual-expected));
    return{
      baseElo:safeBase,
      opponentElo:safeOpponent,
      expectedScore:expected,
      actualScore:actual,
      delta,
      updatedElo:safeBase+delta
    };
  }

  function preview({eloState={},opponentElo,result}){
    const base=eloState.eloCommitted
      ?Number(eloState.eloBeforeUpdate)
      :Number(eloState.currentElo??eloState.initialElo);
    return calculate({
      baseElo:Number.isFinite(base)?base:1200,
      opponentElo,
      result:result??eloState.result
    });
  }

  function tier(elo){
    const value=Number(elo);
    return value>=1450?'골드 I'
      :value>=1375?'골드 II'
      :value>=1300?'실버 III'
      :value>=1225?'실버 II'
      :value>=1150?'실버 I'
      :'브론즈 III';
  }

  return{calculate,preview,tier,kFactor:Number(kFactor),architecture:'v2.1-domain-engine'};
}
