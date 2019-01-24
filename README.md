
## The installation process

1. copy repository with command:
    ```bash
    git clone https://github.com/tobiasz18/Puppeteer-Crawler.git
    ```
    * or download zip

2. type in terminal:
    ```bash
    npm install
    ```
 
3. install reddis date base:
 * if you using windows download from : https://github.com/MicrosoftArchive/redis/releases



## Getting Started / How to run on windows

1. run redis-server from the file you downloaded(Redis-x64-3.2.100)
2. choice your url from crawl.js || URL variable 
3. clear your data base:

 * run redis-cli from the file you downloaded(Redis-x64-3.2.100) 
 * type command - flushall 

4. type in your terminal to start:

    ```bash
    node crawl
    ``` 

## Check error handling

  ```bash  
  npm run test
```

## output 

![alt text](https://ibb.co/tsGypZ7)


## what if you want to stop the crawler and start again 

1. Stop crowling , you can use crlt-c
2. change file name in output: example www.onet.pl to onet.pl
3. clear data base:
 * open redis-cli file and write command:  flushall
4. run in terminal:
   ```bash
    node crawl
    ```  


## Built With
* [GoogleChromeLabs](https://github.com/GoogleChromeLabs/puppeteer-examples) 
* [headless-chrome-crawler](https://github.com/yujiosaka/headless-chrome-crawler) 
