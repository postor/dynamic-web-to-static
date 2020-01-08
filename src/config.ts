import { join } from 'path'
import * as yargs from 'yargs'

const argv = yargs
  .option('base-url', {
    alias: 'u',
    type: 'string',
    description: 'base url of dynamic web',
    required: true,
  })
  .option('output-path', {
    alias: 'o',
    type: 'string',
    description: 'path for static content generated',
    default: join(process.cwd(), 'generated')
  })
  .help()
  .argv

export default argv