import { url2path, fullUrl } from './utils'
const queue = []
const set = new Set()

export const push = (rawUrl = '') => {
  if (!rawUrl) return
  let url = fullUrl(rawUrl)
  if (!url) return
  if (set.has(url)) return
  set.add(url)
  queue.push(url)
  url2path(url)
}

export const pop = () => queue.pop()