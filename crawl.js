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
        const featureArticle = (await page.$x('//title'))[0];

        result.evaluatet = await page.evaluate((el) => {
        
          return el.textContent;
        }, featureArticle);

        return result;
     
    },
    
    onSuccess: async (result) => {
      console.log(result.response.url)
     // console.log(result.page)
     console.log(result.evaluatet)
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

