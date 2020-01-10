
import { URL } from 'url'
import { join, extname, dirname, relative } from 'path'
import { ensureDir, writeFile, writeFileSync, readFile, readFileSync } from 'fs-extra'
import * as replaceAll from 'replaceall'
import { str as crc32 } from 'crc-32'
import { lookup } from 'mime-types'
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

export const save = async (url = '', data: any) => {
  let content = (data.then) ? await data : data
  let filePath = url2path(url)
  if (saveDic[filePath]) return
  saveDic[filePath] = true
  let dir = dirname(filePath)
  await ensureDir(dir)
  await writeFile(filePath, content)
  console.log(`${url} saved to ${filePath}`)
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
  relativePath = decodeURIComponent(relativePath)
  if (searchCrc && needCrc32(pathname)) relativePath = `${relativePath}-${searchCrc}`
  relativePath += (ext || targetExt)
  if (relativePath.startsWith('/')) relativePath = relativePath.substring(1)
  let fullPath = join(basePath, ...(relativePath.split('/')))
  replaceDic[url] = fullPath
  return fullPath
}

export async function replaceLinkInFiles(sync = false) {
  for (let filePath in saveDic) {
    if (!needModify(filePath)) continue
    console.log('needModify', filePath)
    let content = sync ? readFileSync(filePath, 'utf-8') : await readFile(filePath, 'utf-8')
    content = Object.entries(replaceDic)
      .sort(([k1, v1], [k2, v2]) => v2.length - v1.length)
      .reduce((prev, [key, value]) => {
        // console.log(`replace [${key}] to [${relativeUrl(value)}]`)
        const to = relativeUrl(value)
        const froms = needReplacedUrls(key)
        return froms.reduce((prev, from) => {
          // console.log([from, to])
          if (!from) return prev
          if (from === to) return prev
          let t = replaceAll(`"${from}"`, `"${to}"`, prev)
          return replaceAll(`'${from}'`, `'${to}'`, t)
        }, prev)
      }, content)
    sync ? writeFileSync(filePath, content) : await writeFile(filePath, content)
    console.log(`file ${filePath} updated!`)
  }
}

function needModify(filePath) {
  const whitelist = [
    'text',
    'json',
    'javascript',
  ]
  const mime = lookup(filePath)
  // console.log(mime,filePath)
  if (!mime) return false
  if (whitelist.some(x => mime.includes(x))) return true
  return false
}

function needReplacedUrls(url = '', currentFile = '') {
  let rtn = [url]
  const { protocol, origin, pathname, search } = new URL(url)
  rtn.push(url.substring(protocol.length)) // '//xx.com/xx.css'
  rtn.push(url.substring(origin.length)) // '/xx.css'
  const currentUrlDir = dirname(relativeUrl(currentFile))
  let newPath = relative(currentUrlDir, pathname)
  rtn.push(replaceAll('\\', '/', newPath) + search)
  // console.log(rtn)
  return rtn
}

export function waitfor(miliseconds = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, miliseconds)
  })
}

function needCrc32(pathname) {
  const mime = lookup(pathname)
  if (!mime) return true
  if (mime.includes('html')) return true
  return false
}