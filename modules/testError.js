const errorHandle = require('./printErrors.js').handleErrors

async function test() {
    const currenTime = 40;
    const time = 30;
    try { 
      if(currenTime > time)  throw "Timeout";
      
    }
    catch(err) {
        await errorHandle(true, err)
    }
  }

  test()