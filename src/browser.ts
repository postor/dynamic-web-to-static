import { launch, Browser } from 'puppeteer'

let browser: Browser = null

export const getBrowser = () => browser
export const init = async (opt) => {
  browser = await launch(opt)
}