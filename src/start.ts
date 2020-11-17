#!/usr/bin/env node

import config from './config'
import * as queue from './queue'
import { crawlPage } from './page'
import * as browser from './browser'
import { replaceLinkInFiles } from './utils'

let working = true
process.on('SIGINT', function () {
  console.log("\ngracefully shutting down from  SIGINT (Crtl-C)")
  working = false
  // replaceLinkInFilesSync()
  replaceLinkInFiles(true)
    .then(() => browser.getBrowser().close())
    .then(() => process.exit(0))
})
queue.push(config["base-url"] + '/')

  ;
(async () => {
  await browser.init({ headless: true })//{ headless: false, devtools: true })
  let url = queue.pop()
  while (url && working) {
    await crawlPage(url)
    url = queue.pop()
  }
  await browser.getBrowser().close()
  await replaceLinkInFiles()
})()

