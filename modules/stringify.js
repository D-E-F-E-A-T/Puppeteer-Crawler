const stringify = require("csv-stringify");
const fs = require('fs');

async function createStringify(FILE, data, columns)  {
    stringify(data, {header: true, columns: columns}, (err, output) => {
      if(err) throw err;
      fs.writeFileSync(FILE, output, 'utf8', (err) => {
        if(err) throw err;
      })
    })
  }

  
  module.exports.createStringify = createStringify;