import {withSupabase} from 'npm:@supabase/server';

const CORS_HEADERS={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};

const authenticated=withSupabase({auth:'user'},async (req,ctx)=>{
  if(req.method!=='POST'){
    return Response.json(
      {code:'METHOD_NOT_ALLOWED',message:'POST 요청만 허용됩니다.'},
      {status:405,headers:{...CORS_HEADERS,allow:'POST'}}
    );
  }

  const userId=String(ctx.userClaims?.id||'').trim();
  if(!userId){
    return Response.json({code:'AUTH_REQUIRED',message:'로그인이 필요합니다.'},{status:401,headers:CORS_HEADERS});
  }

  const {error}=await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
  if(error){
    console.error('delete-account failed',{userId,code:error.code||null,status:error.status||null});
    return Response.json({code:'ACCOUNT_DELETE_FAILED',message:'계정 삭제를 완료하지 못했습니다.'},{status:500,headers:CORS_HEADERS});
  }

  return Response.json({deleted:true},{headers:CORS_HEADERS});
});

export default {
  async fetch(req:Request){
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS_HEADERS});
    const response=await authenticated(req);
    const headers=new Headers(response.headers);
    for(const [key,value] of Object.entries(CORS_HEADERS))headers.set(key,value);
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
