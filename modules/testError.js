const errorHandle = require('./printErrors.js').handleErrors

async function test() {
    const currenTime = 40;
    const time = 30;
    try { 
      if(currenTime > time)  throw ciociadd.Jolkaaa;
      
      
    }
    catch(err) {
        await errorHandle(true, err.name, err.message)
    }
  }

  test()