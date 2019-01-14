const HCCrawler = require('headless-chrome-crawler');
//const CSVExporter = require('headless-chrome-crawler/exporter/csv');
const fs = require('fs');
const stringify = require("csv-stringify");

const RedisCache = require('headless-chrome-crawler/cache/redis');

const cache = new RedisCache({ host: '127.0.0.1', port: 6379 });

const URL = 'http://www.wp.pl';

const output = `${__dirname}/output/${strin_split(URL)}`
const path_Coverage_List = `${output}/Coverage_Detail_List`;
const path_Features_List = `${output}/Features_Detail_List`;

const coverageDetails = require('./modules/coverage.js').runCoverage;
const FeaturesDetails = require('./modules/features.js').features;

 async function create_Output () {
    await mkdirSync(output)
}
create_Output() //just we need output on start :)

function strin_split(URL) {
  let our_Url = URL.split("/")[2]
  return our_Url
}

const FILE = `${output}/crawler.csv`; //note ADD FOLDER LIKE WWW>WP>PL
const FullCrawler = `${output}/crawler_with_Childrens.csv`; 


let data = []
let columns = {
  URL: 'URL',
  Status: 'Status',
  Title: 'Title',
  h1: 'H1_1',
  h2: 'H2_2',
  h3: 'H3_3',
  Canonical: 'Canonical',
  MetaRobots: 'MetaRobots',
  MetaDescription: 'MetaDescription'
};
let linksData = []
let columnsLinks = {
  Target: 'Target',
  Source: 'Source'
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

async function createStringify(FILE, data, columns, head)  {
  stringify(data, {header: head, columns: columns}, (err, output) => {
    if(err) throw err;
    fs.writeFileSync(FILE, output, 'utf8', (err) => {
      if(err) throw err;
    })
  })
}

async function getUrlLinks(links, FILE, columns, source) {
  for(item of links) {
    linksData.push([source, item])
  }
  await createStringify(FILE, linksData, columns, false)
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
              title: title ? title.textContent.trim() : ' ',
              h1: h1  ? h1.textContent.trim() : ' ',
              h2: h2 ? h2.textContent.trim() : ' ',
              h3: h3 ? h3.textContent.trim() : ' ',
              Canonical: Canonical ? Canonical.textContent.trim() : ' ',
              MetaRobots: MetaRobots ? MetaRobots.textContent.trim() : ' ',
              MetaDescription : MetaDescription ? MetaDescription.textContent.trim() : ' ',
            };
          }, $title, $h1, $h2, $h3, $Canonical, $MetaRobots, $MetaDescription );
        } catch (error) {
          console.log(error.name, " error in crawl.js")
        }
     
        return result;

    },
    
    onSuccess: async (result) => {
      try {
        console.log(result.response.url)
        //  console.log(result.links)
         // console.log(result.evaluate)
          data.push([
            result.response.url.replace(/\s+/g, ' '),
            result.response.status,
            result.evaluate.title.replace(/\s+/g, ' '),
            result.evaluate.h1.replace(/\s+/g, ' '),
            result.evaluate.h2.replace(/\s+/g, ' '),
            result.evaluate.h3.replace(/\s+/g, ' '),
            result.evaluate.Canonical.replace(/\s+/g, ' '),
            result.evaluate.MetaRobots.replace(/\s+/g, ' '),
            result.evaluate.MetaDescription.replace(/\s+/g, ' '),    
          ]);
          await createStringify(FILE, data, columns, true)
          await getUrlLinks(result.links, FullCrawler, columnsLinks, result.response.url)
          await coverageDetails(result.response.url, path_Coverage_List, output)
          await FeaturesDetails(result.response.url, path_Features_List, output)
      } catch (error) {
        console.log(error, ' err from xpath')
      }
  
    },
    maxDepth: 3,
    maxConcurrency: 1,
    cache,
    persistCache: true
  });

  crawler.queue(URL);
//crawler.queue('http://www.wp.pl');
  await crawler.onIdle();
  await crawler.close();
})();