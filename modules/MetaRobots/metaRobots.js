"use strict";
//const LineByLineReader = require("line-by-line");
const tags = require("./modules/tags.js");
const performance = require("./modules/performance.js");
const manipulate = require("./modules/manipulate.js");



async function processFile(Metrics, url) {
  let browser, page, stream;

    stream = await manipulate.initializeWriteStream();
    [browser, page] = await manipulate.initializeBrowser();
    stream.write("URL TTFB trueTTFB indexable(noJS) indexable(js) canonicalised(nojs) canonicalised(js) canonicaltags(nojs) canonicaltags(js) robotsTags(nojs) robotstags(js)\n");

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 300000
      });
    } catch (error) {
      console.log(error, "at ", url);
    }
    Metrics.url = page.url();
    //Measure performance
    [Metrics.performance.TTFB, Metrics.performance.trueTTFB] = await performance.measurePerformance(
      page
    );

    Metrics.Lists.canonicalsWithJavaScript = await tags.extractCanonicals(page);
    Metrics.numberOfTags.canonicalsWithJavaScirpt = Metrics.Lists.canonicalsWithJavaScript.length;
    Metrics.canonicalization.withJavaScript = tags.isCanonicalised(Metrics.url, Metrics.Lists.canonicalsWithJavaScript);

    Metrics.Lists.robotsWithJavaScript = await tags.extractRobotsTag(page);
    Metrics.numberOfTags.robotsWithJavaScriptS = Metrics.Lists.robotsWithJavaScript.length;
    Metrics.indexability.withJavaScript = tags.isIndexable(Metrics.Lists.robotsWithJavaScript);

    //Turn JavaScript OFF
    await page.setJavaScriptEnabled(false);
    await page.reload();

    Metrics.Lists.canonicalsWithoutJavaScript = await tags.extractCanonicals(page);
    Metrics.numberOfTags.canonicalsWithoutJavaScirpt = Metrics.Lists.canonicalsWithoutJavaScript.length;
    Metrics.canonicalization.withoutJavaScript = tags.isCanonicalised(Metrics.url, Metrics.Lists.canonicalsWithoutJavaScript);

    Metrics.Lists.robotsWithoutJavaScript = await tags.extractRobotsTag(page);
    Metrics.numberOfTags.robotsWithoutJavaScript = Metrics.Lists.robotsWithoutJavaScript.length;
    Metrics.indexability.withoutJavascript = tags.isIndexable(Metrics.Lists.robotsWithoutJavaScript);

    console.log(Metrics);
    manipulate.writeResults(stream, Metrics);

    //Restart browser (because of persistent connection for TTFB measurements)
    await browser.close();
    manipulate.initializeBrowser()
      .then(results => {
        [browser, page] = results;
      })
      .catch(err => {
        console.log("Cannot initialize browser");
      });

    setTimeout(() =>  {
      // ...and continue emitting lines
      console.log('');
       browser.close(); 
    }, 3000);

}
module.exports.processFile = processFile;