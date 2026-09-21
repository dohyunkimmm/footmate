import {withSupabase} from 'npm:@supabase/server';

export default {
  fetch: withSupabase({auth:'user'},async (req,ctx)=>{
    if(req.method!=='POST'){
      return Response.json({code:'METHOD_NOT_ALLOWED',message:'POST 요청만 허용됩니다.'},{status:405,headers:{allow:'POST'}});
    }

    const userId=String(ctx.userClaims?.id||'').trim();
    if(!userId){
      return Response.json({code:'AUTH_REQUIRED',message:'로그인이 필요합니다.'},{status:401});
    }

    const {error}=await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if(error){
      console.error('delete-account failed',{userId,code:error.code||null,status:error.status||null});
      return Response.json({code:'ACCOUNT_DELETE_FAILED',message:'계정 삭제를 완료하지 못했습니다.'},{status:500});
    }

    return Response.json({deleted:true});
  })
};
