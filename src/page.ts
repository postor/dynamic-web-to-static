import { getBrowser } from "./browser"
import * as queue from './queue'
import { needSave, waitfor, save } from './utils'
import { EventEmitter } from 'events'


export async function crawlPage(url = '') {
  const browser = getBrowser()
  const page = await browser.newPage()
  let emitter = new EventEmitter(), savingHandles = 0
  page.on('response', (res) => {
    const responseUrl = res.url() //decodeURIComponent(res.url())
    if (!needSave(responseUrl)) return
    if (res.status() >= 300) {
      if (res.status() >= 400) {
        console.log({ url, responseUrl, success: false, status: res.status() })
      }
      return
    }
    savingHandles++
    // console.log({ savingHandles, '++': 1 })
    save(responseUrl, res.buffer())
      .catch(error => {
        console.log({ url, responseUrl, success: false })
      })
      .finally(() => {
        savingHandles--
        if (!savingHandles) {
          emitter.emit('finished')
        }
      })
  })
  try {
    await page.goto(url, { "waitUntil": "networkidle0" })
  } catch (e) {
    console.log(url, e)
  }
  await waitfor(1000)
  if (savingHandles) {
    console.log({ savingHandles, waiting: true })
    await Promise.race(
      [
        new Promise((resolve) => {
          emitter.once('finished', resolve)
        }),
        waitfor(60 * 1000)
      ]
    )
  }
  const aTags = await page.$$('a')
  const links = await Promise.all(aTags.map(x => x.evaluate(y => y.getAttribute('href'))))
  // console.log(links)
  links
    .filter(x => needSave(x))
    .forEach(x => queue.push(x))
  await page.close()
}