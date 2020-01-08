
import { URL } from 'url'
import { join, extname, dirname, relative } from 'path'
import { ensureDir, writeFile } from 'fs-extra'
import replaceAll from 'replaceall'
import { str as crc32 } from 'crc-32'

import config from './config'

const baseUrl = config["base-url"]
const basePath = config["output-path"]

const replaceDic: { [key: string]: string; } = {}
const saveDic: { [key: string]: boolean; } = {}

export const fullUrl = (url = '') => {
  if (url.startsWith('/')) return baseUrl + url
  if (url.startsWith('http')) return url
  return ''
}

export const needSave = (url = '') => {
  if (!url) return false
  let t = url.startsWith('/') ? fullUrl(url) : url
  return t.startsWith(baseUrl)
}


export const needModify = (url = '', options = {}) => {
  return url.startsWith(config["base-url"])
}

export const save = async (url = '', data: any) => {
  let content = (data.then) ? await data : data
  if (saveDic[url]) return
  saveDic[url] = true
  let filePath = url2path(url)
  let dir = dirname(filePath)
  await ensureDir(dir)
  await writeFile(filePath, content)
  console.log(filePath)
}

function relativeUrl(filePath = '') {
  let url = relative(basePath, filePath)
  if (process.platform === "win32") {
    url = replaceAll('\\', '/', url)
  }
  if (url.endsWith('index.html')) {
    url = url.substring(0, url.length - 'index.html'.length)
  }
  return '/' + url
}

export function url2path(url = '', options = {}) {
  if (replaceDic[url]) return replaceDic[url]

  const { pathname, search } = new URL(url)
  let relativePath = pathname
    , targetExt = '.html'

  const ext = extname(pathname)
  const searchCrc = search ? crc32(search) : ''
  if (pathname.endsWith('/')) {
    relativePath = pathname + 'index'
  }
  if (ext) {
    relativePath = relativePath.substring(0, relativePath.length - ext.length)
  }
  if (searchCrc) relativePath = `${relativePath}-${searchCrc}`
  relativePath += (ext || targetExt)
  if (relativePath.startsWith('/')) relativePath = relativePath.substring(1)
  let fullPath = join(basePath, ...(relativePath.split('/')))
  replaceDic[url] = fullPath
  return fullPath
}
