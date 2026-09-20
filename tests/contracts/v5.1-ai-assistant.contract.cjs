const assert=require('node:assert/strict');
const {Readable}=require('node:stream');
const handler=require('../../api/ai-match-assistant.js');

function request({method='GET',body=null,ip='127.0.0.1'}={}){
  const source=body==null?[]:[Buffer.from(JSON.stringify(body))];
  const req=Readable.from(source);
  req.method=method;
  req.headers={host:'footmate-black.vercel.app',origin:'https://footmate-black.vercel.app','x-forwarded-for':ip};
  req.socket={remoteAddress:ip};
  return req;
}
function response(){
  const headers={};
  let body='';
  return {
    statusCode:200,
    setHeader(name,value){headers[String(name).toLowerCase()]=value},
    end(value=''){body+=value},
    snapshot(){return{statusCode:this.statusCode,headers,body:body?JSON.parse(body):null}}
  };
}
async function invoke(options){const req=request(options);const res=response();await handler(req,res);return res.snapshot()}

(async()=>{
  const oldFetch=global.fetch;
  const oldKey=process.env.AI_GATEWAY_API_KEY;
  const oldOidc=process.env.VERCEL_OIDC_TOKEN;
  try{
    delete process.env.AI_GATEWAY_API_KEY;delete process.env.VERCEL_OIDC_TOKEN;
    const unavailable=await invoke({method:'POST',body:{message:'수원에서 가까운 경기',preferences:{region:'수원 · 영통',position:'MF',level:'중급'}},ip:'10.0.0.1'});
    assert.equal(unavailable.statusCode,503);
    assert.equal(unavailable.body.mode,'unavailable');
    assert.equal(unavailable.body.error,'ai_provider_not_configured');

    process.env.AI_GATEWAY_API_KEY='test-key';
    global.fetch=async(url,options)=>{
      assert.equal(url,'https://ai-gateway.vercel.sh/v1/responses');
      assert.equal(options.method,'POST');
      const payload=JSON.parse(options.body);
      assert.equal(payload.model,'openai/gpt-5.4-mini');
      assert.equal(payload.text.format.type,'json_schema');
      assert.equal(payload.text.format.strict,true);
      return {ok:true,status:200,json:async()=>({output:[{content:[{type:'output_text',text:JSON.stringify({intent:'search',region:'수원 · 인계',position:'MF',level:'초중급',maxPrice:18000,maxDistanceMin:20,afterTime:'20:00',reply:'수원 인계에서 20시 이후 조건으로 정리했어요.'})}]}]})};
    };
    const connected=await invoke({method:'POST',body:{message:'인계에서 8시 이후 가까운 초중급 MF 경기',preferences:{region:'수원 · 영통',position:'MF',level:'중급'}},ip:'10.0.0.2'});
    assert.equal(connected.statusCode,200);
    assert.equal(connected.body.mode,'connected-ai');
    assert.equal(connected.body.provider,'vercel-ai-gateway');
    assert.equal(connected.body.model,'openai/gpt-5.4-mini');
    assert.equal(connected.body.result.region,'수원 · 인계');
    assert.equal(connected.body.result.position,'MF');
    assert.equal(connected.body.result.afterTime,'20:00');
    assert.equal(connected.body.result.maxDistanceMin,20);

    global.fetch=async()=>({ok:true,status:200,json:async()=>({output:[{content:[{type:'output_text',text:JSON.stringify({intent:'search',region:'존재하지 않는 지역',position:'XX',level:'프로',maxPrice:999999,maxDistanceMin:1,afterTime:'99:99',reply:'guardrail test'})}]}]})});
    const guarded=await invoke({method:'POST',body:{message:'아무 경기',preferences:{}},ip:'10.0.0.3'});
    assert.equal(guarded.statusCode,200);
    assert.equal(guarded.body.result.region,null);
    assert.equal(guarded.body.result.position,null);
    assert.equal(guarded.body.result.level,null);
    assert.equal(guarded.body.result.maxPrice,50000);
    assert.equal(guarded.body.result.maxDistanceMin,5);
    assert.equal(guarded.body.result.afterTime,null);

    global.fetch=async()=>({ok:false,status:403,json:async()=>({error:{type:'access_denied',message:'Forbidden.'}})});
    const denied=await invoke({method:'POST',body:{message:'가까운 경기',preferences:{}},ip:'10.0.0.5'});
    assert.equal(denied.statusCode,502);
    assert.equal(denied.body.error,'ai_gateway_error');
    assert.equal(denied.body.gatewayType,'access_denied');

    const health=await invoke({method:'GET',ip:'10.0.0.4'});
    assert.equal(health.statusCode,200);
    assert.equal(health.body.version,'5.1.0');
    assert.equal(health.body.provider,'vercel-ai-gateway');
    assert.equal(health.body.model,'openai/gpt-5.4-mini');
    assert.equal(health.body.configured,true);
    console.log('PASS v5.1 AI assistant contract');
  }finally{
    global.fetch=oldFetch;
    if(oldKey===undefined)delete process.env.AI_GATEWAY_API_KEY;else process.env.AI_GATEWAY_API_KEY=oldKey;
    if(oldOidc===undefined)delete process.env.VERCEL_OIDC_TOKEN;else process.env.VERCEL_OIDC_TOKEN=oldOidc;
  }
})().catch(error=>{console.error(error);process.exitCode=1});
