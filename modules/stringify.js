const stringify = require("csv-stringify");
const fs = require('fs');

async function createStringify(FILE, data, columns)  {
  console.log('give me answear')
  try {
    if(!fs.existsSync(FILE)) {
      console.log(FILE)
      await stringifyPrint(data, columns, true, FILE)
      console.log('first IF')
    }

   // await stringifyPrint(data, columns, false, FILE)
    console.log('second IF')
    stringify(data, {header: false, columns: columns}, (err, output) => {
      if(err) throw err;
      
      fs.appendFileSync(FILE, output, 'utf8', (err) => {
        if(err) throw err;
      })
    })

  } catch(error) {
    console.log(error, "Error from createStringify")
  } 
}


async function stringifyPrint(data, columns, flag, FILE) {
  stringify(data, {header: flag, columns: columns}, (err, output) => {
    if(err) throw err;
    fs.writeFileSync(FILE, output, 'utf8', (err) => {
      if(err) throw err;
    })
  })
}
  
module.exports.createStringify = createStringify;
