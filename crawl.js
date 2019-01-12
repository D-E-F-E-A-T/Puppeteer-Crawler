const HCCrawler = require('headless-chrome-crawler');
const CSVExporter = require('headless-chrome-crawler/exporter/csv');
const fs = require('fs');

const URL = 'http://botbenchmarking.com/indexing_experiment/indexing_html.html'


const output = `${__dirname}/output`
const path_Coverage_List = `${__dirname}/output/Coverage_Detail_List`;
const path_Features_List = `${__dirname}/output/Features_Detail_List`;

const create_Output = async () => {
    await mkdirSync(output)
}
create_Output()

const FILE = `${__dirname}/output/result.csv`;
const exporter = new CSVExporter({
  file: FILE,
  fields: ['response.url', 'response.status', 'links.length'],
});

(async () => {

  await mkdirSync(path_Coverage_List)
  await mkdirSync(path_Features_List)

  const crawler = await HCCrawler.launch({
    evaluatePage: (() => ({
      title: $('title').text(),
    })),
    onSuccess: (result => {
     console.log(result.links);
    }),
    maxDepth: 4,
    exporter
  });

  crawler.queue(URL);
// crawler.queue('http://www.wp.pl');
  await crawler.onIdle();
  await crawler.close();
})();



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
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
  }

