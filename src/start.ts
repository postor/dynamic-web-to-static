#!/usr/bin/env node

import config from './config'
import * as queue from './queue'
import { crawlPage } from './page'
import * as browser from './browser'


queue.push(config["base-url"] + '/')
  ;
(async () => {
  await browser.init({ headless: false })
  let url = queue.pop()
  while (url) {
    await crawlPage(url)
    url = queue.pop()
  }
  await browser.getBrowser().close()
})()

