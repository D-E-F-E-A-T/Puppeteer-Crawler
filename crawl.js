const HCCrawler = require('headless-chrome-crawler');
//const CSVExporter = require('headless-chrome-crawler/exporter/csv');
const fs = require('fs');
const stringify = require("csv-stringify");

const URL = 'http://www.onet.pl'

const output = `${__dirname}/output`
const path_Coverage_List = `${__dirname}/output/Coverage_Detail_List`;
const path_Features_List = `${__dirname}/output/Features_Detail_List`;

const create_Output = async () => {
    await mkdirSync(output)
}
create_Output() //just we need output on start :)

const FILE = `${__dirname}/output/result2.csv`;

let data = []
let columns = {
  URL: 'URL'
};

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


async function createStringify(FILE, data)  {
  stringify(data, {header: true, columns: columns}, (err, output) => {
    if(err) throw err;
    fs.writeFileSync(FILE, output, 'utf8', (err) => {
      if(err) throw err;
    })
  })
}

(async () => {

  await mkdirSync(path_Coverage_List)
  await mkdirSync(path_Features_List)

  const crawler = await HCCrawler.launch({

      customCrawl: async (page, crawl) => {

        const result = await crawl();

        const $title = (await page.$x('//title'))[0];
        const $h1 = (await page.$x('//h1'))[0];
        const $h2 = (await page.$x('//h2'))[0];
        const $h3 = (await page.$x('//h3'))[0];

      
          result.evaluate = await page.evaluate((title, h1, h2, h3) => {
     
            
            return {
              title: title ? title.textContent.trim() :  '--',
              h1: h1  ? h1.textContent.trim() : '--',
              h2: h2 ? h2.textContent.trim() : '--',
              h3: h3 ? h3.textContent.trim() : '--',
            };
          }, $title, $h1, $h2, $h3);


        return result;

    },
    
    onSuccess: async (result) => {
      console.log(result.response.url)

     console.log(result.evaluate)
      data.push([result.response.url]);
      await createStringify(FILE, data)
    
    },
    maxDepth: 2,
    maxConcurrency: 1
  });

  crawler.queue(URL);
// crawler.queue('http://www.wp.pl');
  await crawler.onIdle();
  await crawler.close();
})();

