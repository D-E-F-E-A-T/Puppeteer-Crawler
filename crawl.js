const HCCrawler = require('headless-chrome-crawler');
//const CSVExporter = require('headless-chrome-crawler/exporter/csv');
const fs = require('fs');
const stringify = require("csv-stringify");

const URL = 'http://www.wp.pl'


const output = `${__dirname}/output`
const path_Coverage_List = `${output}/Coverage_Detail_List`;
const path_Features_List = `${output}/Features_Detail_List`;

 async function create_Output () {
    await mkdirSync(output)
}
create_Output() //just we need output on start :)

function strin_split()

const FILE = `${output}/crawler.csv`; //note ADD FOLDER LIKE WWW>WP>PL

let data = []
let columns = {
  URL: 'URL',
  Status: 'Status',
  Title: 'Title',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  Canonical: 'Canonical',
  MetaRobots: 'MetaRobots',
  MetaDescription: 'MetaDescription'
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

        const $title = (await page.$x("//title"))[0];
        const $h1 = (await page.$x("//h1"))[0];
        const $h2 = (await page.$x("//h2"))[0];
        const $h3 = (await page.$x("//h3"))[0];
        const $Canonical = (await page.$x("//link[@rel='canonical']/@href"))[0];        
        const $MetaRobots = (await page.$x("//meta[@name='robots']/@content"))[0];           
        const $MetaDescription  = (await page.$x("//meta[@name='description']/@content"))[0];        

        try {
          result.evaluate = await page.evaluate((title, h1, h2, h3, Canonical, MetaRobots, MetaDescription ) => {
              
            return {
              title: title ? title.textContent.trim() : 'not found',
              h1: h1  ? h1.textContent.trim() : 'not found',
              h2: h2 ? h2.textContent.trim() : 'not found',
              h3: h3 ? h3.textContent.trim() : 'not found',
              Canonical: Canonical ? Canonical.textContent.trim() : 'not found',
              MetaRobots: MetaRobots ? MetaRobots.textContent.trim() : 'not found',
              MetaDescription : MetaDescription ? MetaDescription.textContent.trim() : 'not found',
            };
          }, $title, $h1, $h2, $h3, $Canonical, $MetaRobots, $MetaDescription );
        } catch (error) {
          console.log(error.name, " error in crawl.js")
        }
     
        return result;

    },
    
    onSuccess: async (result) => {
      console.log(result.response.url)
     // console.log(result.evaluate)
      data.push([
        result.response.url,
        result.response.status,
        result.evaluate.title,
        result.evaluate.h1,
        result.evaluate.h2,
        result.evaluate.h3,
        result.evaluate.Canonical,
        result.evaluate.MetaRobots,
        result.evaluate.MetaDescription,     
      ]);
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

