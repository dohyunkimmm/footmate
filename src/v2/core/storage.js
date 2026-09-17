const PREFIX='footmate:v2:';

export function createStorage(namespace='ui'){
  const key=PREFIX+namespace;

  function read(fallback={}){
    try{
      const parsed=JSON.parse(localStorage.getItem(key)||'null');
      return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:fallback;
    }catch(error){
      console.warn('[FootMate v2] storage read failed',error);
      return fallback;
    }
  }

  function write(value){
    try{
      localStorage.setItem(key,JSON.stringify(value));
      return value;
    }catch(error){
      console.warn('[FootMate v2] storage write failed',error);
      return value;
    }
  }

  function update(recipe,fallback={}){
    const current=read(fallback);
    const next=typeof recipe==='function'?recipe({...current}):{...current,...recipe};
    return write(next);
  }

  function clear(){
    try{localStorage.removeItem(key)}catch(error){
      console.warn('[FootMate v2] storage clear failed',error);
    }
  }

  return{key,read,write,update,clear};
}
