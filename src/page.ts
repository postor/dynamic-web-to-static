import { getBrowser } from "./browser"
import * as queue from './queue'
import { needSave, fullUrl, save } from './utils'
import { EventEmitter } from 'events'


export async function crawlPage(url) {
  const browser = getBrowser()
  const page = await browser.newPage()
  let emitter = new EventEmitter(), savingHandles = 0
  page.on('response', (res) => {
    const url = res.url()
    savingHandles++
    console.log({ savingHandles, '++': 1 })
    save(url, res.buffer()).then(() => {
      console.log({ savingHandles, '--': 1 })
      savingHandles--
      if (!savingHandles) {
        emitter.emit('finished')
      }
    })
  })
  await page.goto(url)
  console.log({ savingHandles })
  if (savingHandles) {
    await new Promise((resolve) => {
      emitter.once('finished', resolve)
    })
  }
  const aTags = await page.$$('a')
  const links = await Promise.all(aTags.map(x => x.evaluate(y => y.getAttribute('href'))))
  // console.log(links)
  links
  .filter(x=>needSave(x))
  .forEach(x => queue.push(x))
  await page.close()
}