function send(res,status,payload){
  res.statusCode=status;
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','no-store');
  res.setHeader('x-content-type-options','nosniff');
  res.end(JSON.stringify(payload));
}

export default function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('allow','GET');
    return send(res,405,{connected:false,code:'METHOD_NOT_ALLOWED'});
  }
  const url=String(process.env.SUPABASE_URL||'').trim().replace(/\/$/,'');
  const publishableKey=String(process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY||'').trim();
  if(!url||!publishableKey){
    return send(res,503,{connected:false,code:'BETA_BACKEND_NOT_CONFIGURED'});
  }
  try{
    const parsed=new URL(url);
    if(parsed.protocol!=='https:')throw new Error('https required');
  }catch{
    return send(res,503,{connected:false,code:'BETA_BACKEND_INVALID_CONFIG'});
  }
  return send(res,200,{connected:true,url,publishableKey});
}
