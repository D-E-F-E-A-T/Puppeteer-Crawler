const fs = require('fs');
const stringify = require('csv-stringify');

async function handleErrors(flag, name) {
    try {
        
        let data = [];
        let columns = {
          name: 'name'   
        }
        data.push([name])

        await printError(flag, columns, data)

    } catch (error) {
        console.log(error.name,':', error.message, '|| from: printErrors.js')
       // await handleErrors(flag, name)
    }
}

async function printError(flag, columns, data) {



    stringify(data, {header: flag, columns: columns}, (err, output) => {
        if(err) throw err;
        fs.appendFileSync('./errors.csv', output, 'utf8', (err) => {
            if (err) throw err;
        })
    })
}

async function mkdirSync(dirPath) {
    try {
        if(!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath)
        }
    } catch (error) {
        
    }
}

async function mkdirSync(dirPath) {
    try {
      dirPath.split('/').reduce((parentPath, dirName) => {
        const currentPath = parentPath + dirName;
        if (!fs.existsSync(currentPath)) {
          fs.mkdirSync(currentPath);
        }
        return currentPath + '/';
      }, '');
    } catch (err) {
      if (err.name !== 'EEXIST') {
        throw err;
      }
    }
}

module.exports.handleErrors = handleErrors;