const assert=require('node:assert/strict');
const fs=require('node:fs');
const {Readable}=require('node:stream');
const handler=require('../../api/ai-match-assistant.js');
const release=JSON.parse(fs.readFileSync('release.json','utf8'));

function request({method='GET',body=null,ip='127.0.0.1',origin='https://footmate-black.vercel.app',contentType='application/json',site='same-origin'}={}){
  const source=body==null?[]:[Buffer.from(JSON.stringify(body))];
  const req=Readable.from(source);
  req.method=method;
  req.headers={host:'footmate-black.vercel.app','x-forwarded-for':ip};
  if(origin!==null)req.headers.origin=origin;
  if(contentType!==null)req.headers['content-type']=contentType;
  if(site!==null)req.headers['sec-fetch-site']=site;
  req.socket={remoteAddress:ip};
  return req;
}
function response(){const headers={};let body='';return{statusCode:200,setHeader(name,value){headers[String(name).toLowerCase()]=value},end(value=''){body+=value},snapshot(){return{statusCode:this.statusCode,headers,body:body?JSON.parse(body):null}}}}
async function invoke(options){const req=request(options);const res=response();await handler(req,res);return res.snapshot()}

(async()=>{
  const oldFetch=global.fetch,oldKey=process.env.AI_GATEWAY_API_KEY,oldOidc=process.env.VERCEL_OIDC_TOKEN;
  try{
    delete process.env.AI_GATEWAY_API_KEY;delete process.env.VERCEL_OIDC_TOKEN;
    const crossOrigin=await invoke({method:'POST',body:{message:'경기 찾아줘'},origin:'https://evil.example',ip:'10.0.1.1'});
    assert.equal(crossOrigin.statusCode,403);
    const badType=await invoke({method:'POST',body:{message:'경기 찾아줘'},contentType:'text/plain',ip:'10.0.1.2'});
    assert.equal(badType.statusCode,415);
    const unavailable=await invoke({method:'POST',body:{message:'수원에서 가까운 경기',preferences:{region:'수원 · 영통',position:'MF',level:'중급'}},ip:'10.0.1.3'});
    assert.equal(unavailable.statusCode,503);assert.equal(unavailable.body.mode,'unavailable');assert.equal(unavailable.body.error,'ai_provider_not_configured');

    process.env.AI_GATEWAY_API_KEY='test-key';
    global.fetch=async(url,options)=>{
      assert.equal(url,'https://ai-gateway.vercel.sh/v1/responses');assert.equal(options.method,'POST');assert.ok(options.signal);
      const payload=JSON.parse(options.body);assert.equal(payload.model,'inclusionai/ling-3.0-flash-vl-free');assert.deepEqual(payload.reasoning,{effort:'none'});assert.equal(payload.text,undefined);
      return {ok:true,status:200,json:async()=>({output_text:JSON.stringify({intent:'search',region:'수원 · 인계',position:'MF',level:'초중급',maxPrice:18000,maxDistanceMin:20,afterTime:'20:00',reply:'수원 인계에서 20시 이후 조건으로 정리했어요.'})})};
    };
    const connected=await invoke({method:'POST',body:{message:'인계에서 8시 이후 가까운 초중급 MF 경기',preferences:{region:'수원 · 영통',position:'MF',level:'중급'}},ip:'10.0.1.4'});
    assert.equal(connected.statusCode,200);assert.equal(connected.body.version,release.version);assert.equal(connected.body.mode,'connected-ai');assert.equal(connected.body.provider,'vercel-ai-gateway');assert.equal(connected.body.model,'inclusionai/ling-3.0-flash-vl-free');assert.equal(connected.body.fallbackUsed,false);assert.equal(connected.body.result.region,'수원 · 인계');assert.equal(connected.body.result.position,'MF');assert.equal(connected.body.result.afterTime,'20:00');assert.equal(connected.body.result.maxDistanceMin,20);

    global.fetch=async(_url,options)=>{const payload=JSON.parse(options.body);assert.deepEqual(payload.reasoning,{effort:'none'});return{ok:true,status:200,json:async()=>({output_text:JSON.stringify({intent:'search',region:'존재하지 않는 지역',position:'XX',level:'프로',maxPrice:999999,maxDistanceMin:1,afterTime:'99:99',reply:'guardrail test'})})}};
    const guarded=await invoke({method:'POST',body:{message:'아무 경기',preferences:{}},ip:'10.0.1.5'});
    assert.equal(guarded.statusCode,200);assert.equal(guarded.body.result.region,null);assert.equal(guarded.body.result.position,null);assert.equal(guarded.body.result.level,null);assert.equal(guarded.body.result.maxPrice,50000);assert.equal(guarded.body.result.maxDistanceMin,5);assert.equal(guarded.body.result.afterTime,null);

    let calls=0;
    global.fetch=async(_url,options)=>{calls+=1;const payload=JSON.parse(options.body);assert.deepEqual(payload.reasoning,{effort:'none'});if(calls===1){assert.equal(payload.model,'inclusionai/ling-3.0-flash-vl-free');return{ok:false,status:403,json:async()=>({error:{type:'no_providers_available',message:'No providers available'}})}}assert.equal(payload.model,'inclusionai/ling-3.0-flash-fin-free');return{ok:true,status:200,json:async()=>({output_text:'```json\n{"intent":"search","region":"수원 · 인계","position":"MF","level":"초중급","maxPrice":18000,"maxDistanceMin":20,"afterTime":"20:00","reply":"provider fallback으로 조건을 해석했어요."}\n```'})}};
    const fallback=await invoke({method:'POST',body:{message:'인계에서 초중급 MF 경기',preferences:{}},ip:'10.0.1.6'});
    assert.equal(fallback.statusCode,200);assert.equal(fallback.body.mode,'connected-ai');assert.equal(fallback.body.model,'inclusionai/ling-3.0-flash-fin-free');assert.equal(fallback.body.fallbackUsed,true);assert.equal(fallback.body.result.region,'수원 · 인계');assert.equal(calls,2);

    global.fetch=async(_url,options)=>{const payload=JSON.parse(options.body);assert.deepEqual(payload.reasoning,{effort:'none'});return{ok:false,status:403,json:async()=>({error:{type:'access_denied',message:'Forbidden.'}})}};
    const denied=await invoke({method:'POST',body:{message:'가까운 경기',preferences:{}},ip:'10.0.1.7'});
    assert.equal(denied.statusCode,502);assert.equal(denied.body.error,'ai_gateway_error');assert.equal(denied.body.gatewayType,'access_denied');assert.equal(denied.body.model,'inclusionai/ling-3.0-flash-fin-free');

    const health=await invoke({method:'GET',ip:'10.0.1.8'});
    assert.equal(health.statusCode,200);assert.equal(health.body.version,release.version);assert.equal(health.body.provider,'vercel-ai-gateway');assert.equal(health.body.model,'inclusionai/ling-3.0-flash-vl-free');assert.equal(health.body.fallbackModel,'inclusionai/ling-3.0-flash-fin-free');assert.equal(health.body.gatewayTimeoutMs,3000);assert.equal(health.body.reasoningEffort,'none');assert.equal(health.body.configured,true);
    console.log(`PASS ${release.version} AI assistant contract`);
  }finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.AI_GATEWAY_API_KEY;else process.env.AI_GATEWAY_API_KEY=oldKey;if(oldOidc===undefined)delete process.env.VERCEL_OIDC_TOKEN;else process.env.VERCEL_OIDC_TOKEN=oldOidc}
})().catch(error=>{console.error(error);process.exitCode=1});
