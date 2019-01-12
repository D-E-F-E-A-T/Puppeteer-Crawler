
const stringify = require('csv-stringify');
const fs = require('fs');
const puppeteer = require('puppeteer');
const chalk = require('chalk');
const Table = require('cli-table');


const URL = process.env.URL || 'https://github.com';

const EVENTS = [
  'domcontentloaded',
  'load',
  // 'networkidle2',
  'networkidle0',
];

function mkdirSync(dirPath) {
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

function formatBytesToKB(bytes) {
  if (bytes > 1024) {
    const formattedNum = new Intl.NumberFormat('en-US', {maximumFractionDigits: 1}).format(bytes / 1024);
    return `${formattedNum}KB`;
  }
  return `${bytes} bytes`;
}

class UsageFormatter {
  constructor(stats) {
    this.stats = stats;
  }

  static eventLabel(event) {
    // const maxEventLabelLen = EVENTS.reduce((currMax, event) => Math.max(currMax, event.length), 0);
    // const eventLabel = event + ' '.repeat(maxEventLabelLen - event.length);
    return event;
  }

  summary(used = this.stats.usedBytes, total = this.stats.totalBytes) {
    const percent = Math.round((used / total) * 100);
    return `${formatBytesToKB(used)}/${formatBytesToKB(total)} (${percent}%)`;
  }

  shortSummary(used, total = this.stats.totalBytes) {
    const percent = Math.round((used / total) * 100);
    return used ? `${formatBytesToKB(used)} (${percent}%)` : 0;
  }

  /**
   * Constructors a bar chart for the % usage of each value.
   * @param {!{jsUsed: number, cssUsed: number, totalBytes: number}=} stats Usage stats.
   * @return {string}
   */
  barGraph(stats = this.stats) {
    // const MAX_TERMINAL_CHARS = process.stdout.columns;
    const maxBarWidth = 30;

    const jsSegment = ' '.repeat((stats.jsUsed / stats.totalBytes) * maxBarWidth);
    const cssSegment = ' '.repeat((stats.cssUsed / stats.totalBytes) * maxBarWidth);
    const unusedSegment = ' '.repeat(maxBarWidth - jsSegment.length - cssSegment.length);

    return chalk.bgRedBright(jsSegment) + chalk.bgBlueBright(cssSegment) +
           chalk.bgBlackBright(unusedSegment);
  }
}

const stats = new Map();

function addUsage(coverage, type, eventType) {
  for (const entry of coverage) {
    if (!stats.has(entry.url)) {
      stats.set(entry.url, []);
    }

    const urlStats = stats.get(entry.url);

    let eventStats = urlStats.find(item => item.eventType === eventType);
    if (!eventStats) {
      eventStats = {
        cssUsed: 0,
        jsUsed: 0,
        get usedBytes() { return this.cssUsed + this.jsUsed; },
        totalBytes: 0,
        get percentUsed() {
          return this.totalBytes ? Math.round(this.usedBytes / this.totalBytes * 100) : 0;
        },
        eventType,
        url: entry.url,
      };
      urlStats.push(eventStats);
    }

    eventStats.totalBytes += entry.text.length;

    for (const range of entry.ranges) {
      eventStats[`${type}Used`] += range.end - range.start - 1;
    }
  }
}

async function collectCoverage(urlTest) {
  const browser = await puppeteer.launch({headless: true});

  const collectPromises = EVENTS.map(async event => {
    console.log(`Collecting coverage @ ${UsageFormatter.eventLabel(event)}...`);

    const page = await browser.newPage();

    // page.on('response', async response => {
    //   console.log(response.request().url(), (await response.text()).length);
    // });

    await Promise.all([
      page.coverage.startJSCoverage(),
      page.coverage.startCSSCoverage()
    ]);

    await page.goto(urlTest, {waitUntil: event}).catch(err => console.log('error Coverage:', err))
    // await page.waitForNavigation({waitUntil: event});

    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage()
    ]);

    addUsage(cssCoverage, 'css', event);
    addUsage(jsCoverage, 'js', event);

    await page.close();
  });

  await Promise.all(collectPromises);

  return browser.close();
}

async function run (urlTest) {
    await features.features(urlTest)
    await collectCoverage(urlTest);

    let mainData = [];
    let columns2 = {
      ID: 'ID',
      Event: 'Event',
      TotalUsed: 'TotalUsed',
      PercentUsed: 'Percent Used',
      url: 'Url'
  };
   
    let data = [];
    let columns = {
      EventType: 'EventType',
      UsedBytes: 'used Bytes',
      JsUsed: 'Js Used',
      CssUsed: 'css Used',
      TotalBytes: 'total Bytes',
      URL: 'URL'
  };


    for (const [url, vals] of stats) {
    //console.log('\n' + chalk.cyan(url));

      const table = new Table({
          // chars: {mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
          head: [
          'Event',
          `${chalk.bgRedBright(' JS ')} ${chalk.bgBlueBright(' CSS ')} % used`,
          'JS used',
          'CSS used',
          'Total bytes used'
          ],
          // style : {compact : true, 'padding-left' : 0}
          style: {head: ['white'], border: ['grey']}
          // colWidths: [20, 20]
      });

      EVENTS.forEach(event => {
          const usageForEvent = vals.filter(val => val.eventType === event);

          if (usageForEvent.length) {
          for (const stats of usageForEvent) {

              const formatter = new UsageFormatter(stats);
              table.push([
              UsageFormatter.eventLabel(stats.eventType),
              formatter.barGraph(),
              formatter.shortSummary(stats.jsUsed), // !== 0 ? `${formatBytesToKB(stats.jsUsed)}KB` : 0,
              formatter.shortSummary(stats.cssUsed),
              formatter.summary()
              ]);

              if(usageForEvent[0].eventType){

              }
              data.push([
                  usageForEvent[0].eventType,
                  `${usageForEvent[0].usedBytes}`,
                  usageForEvent[0].jsUsed,
                  usageForEvent[0].cssUsed,
                  usageForEvent[0].totalBytes,
                  `  ${usageForEvent[0].url}`
              ]);
          }
          } else {
              table.push([UsageFormatter.eventLabel(event), 'no usage found', '-', '-', '-',]);
              data.push([UsageFormatter.eventLabel(event), 'no usage found', '-', '-', '-', `${url}`]);
          }
       });
     }

    //console.log(table.toString()); //output table CLI

   try {

    function slugify(str) {
      return str.split('/')[2]
    }
    
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    var uniqid = randLetter + Date.now();
 

    EVENTS.forEach(event => {
      let totalBytes = 0;
      let totalUsedBytes = 0;
      const metrics = Array.from(stats.values());
      const statsForEvent = metrics.map(eventStatsForUrl => {

          const statsForEvent = eventStatsForUrl.filter(stat => stat.eventType === event)[0];

          if (statsForEvent) {

          totalBytes += statsForEvent.totalBytes;
          totalUsedBytes += statsForEvent.usedBytes;
          }
      });

    const percentUsed = Math.round(totalUsedBytes / totalBytes * 100);

    mainData.push([uniqid, event, ` ${formatBytesToKB(totalUsedBytes)}/${formatBytesToKB(totalBytes)}`, `${percentUsed}%`, urlTest])
    });

    const DIR =  `output\\${slugify(urlTest)}`;
    const DIR2 = `output\\${slugify(urlTest)}\\Coverage_List_ID`;
    function slugify(str) {
      return str.split('/')[2]
    }

    stringify(mainData, { header: false, columns: columns2 }, (err, output) => {
      if (err) throw err;
      fs.appendFile(`${__dirname}\\${DIR}\\css_js_coverage.csv`, output, (err) => {
        if (err) throw err;
        //console.log('features.csv saved.');
      });
    });
    let myPath = `${__dirname}\\${DIR2}\\`
    stringify(data, { header: true, columns: columns }, (err, output) => {
      if (err) throw err;

      mkdirSync(myPath)

      fs.writeFile(`${__dirname}\\${DIR2}\\${uniqid}.csv`, output, (err) => {
          if (err) throw err;
          data = [];
          });
      });
   } catch (error) {
     console.log(error)
   }
    
};

module.exports.run = run;
