import { join } from 'path'
import chalk from 'chalk'

import { BinFileParams, build, writeBinFile } from './build'
import { BASE_PATH, OUTPUT_PATH, ROOT_PATH } from './const'
import { BuilderOptions } from './types'
import { handleBuildError, resolveDir } from './utils/fs'

const SCRIPT_CONFIGS: BinFileParams[] = [
  {
    fileName: 'index.js',
    filePath: `${OUTPUT_PATH}/generate.js`,
  },
]

const BUILD_ERROR_MSG = chalk.bold('[Secretariat] ESBuild of script files failed.')

const handleScriptBuildError = (reason: unknown) => handleBuildError(BUILD_ERROR_MSG, reason)

const run = async () => {
  const outdir = await resolveDir(join(BASE_PATH, OUTPUT_PATH))

  const options: BuilderOptions = {
    root: ROOT_PATH,
    format: 'cjs',
    outdir,
  }

  const results = await build(options)

  if (!results || results instanceof Error) {
    throw new Error(BUILD_ERROR_MSG)
  }

  return Promise.all(SCRIPT_CONFIGS.map((config) => writeBinFile(config)))
}

run().catch(handleScriptBuildError)
