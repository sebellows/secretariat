import { PathLike } from 'fs'
import { readFile } from 'fs/promises'
import { join } from 'path'
import chalk from 'chalk'

import { logger } from '../logger'

import { findFile, handleBuildError, isFile } from './fs'

/**
 * @name parseArgs
 * @description
 * Generate a Map object from parameters passed via the npm script.
 */
export const parseArgs = <T extends Record<string, any> = Record<string, any>>(
  options: T,
): Map<keyof T, T[keyof T]> => {
  const args = process.argv.slice(2)

  if (!options) {
    options = {} as T
  }

  const map = new Map<keyof T, T[keyof T]>(Object.entries(options))

  while (args.length > 0) {
    // eslint-disable-next-line prefer-const
    let [key, value] = args.splice(0, 2)

    if (key.startsWith('--')) {
      key = key.slice(2)
    }

    map.set(key, key in options ? options[key] : value)
  }

  return map
}

/**
 * @name parseYargs
 * @description
 * Generate a Map object from parameters passed via the npm script.
 */
export const parseYargs = <
  O extends Record<string, any> = Record<string, any>,
  T extends Record<string, any> = Record<string, any>,
>(
  args: T,
  options: O,
): Map<keyof O, O[keyof O]> => {
  if (!options) {
    options = {} as O
  }

  const map = new Map(Object.entries(options))
  const entries = Object.entries(args)

  if (entries.length > 0) {
    entries.forEach(([key, value]) => {
      if (key.startsWith('--')) {
        key = key.slice(2)
      }

      if (key in options) {
        map.set(key, value)
      }
    })
  }

  return map
}

/**
 * @name parseFile
 * @description Return a file's contents.
 *
 * @param filePath - The path to the file to read
 * @param errorMsg - [Optional] error message to display on failure
 */
export const parseFile = async <T = unknown>(
  filePath: PathLike,
  errorMsg = `"${filePath}" is not valid, please specify a file or use inline JSON.`,
): Promise<T | void> => {
  let json: string | Buffer

  if (isFile(filePath)) {
    json = await readFile(filePath, 'utf8')
  } else {
    json = filePath as string
  }

  try {
    return JSON.parse(json as string)
  } catch (error: unknown) {
    handleBuildError(errorMsg, error)
  }
}

/**
 * @name parseConfig
 * @description
 * Returns a parsing function to process a file's contents and returns a configuration object.
 *
 * @param name - The flag to grab from a commands passed options
 */
export const parseConfig =
  (name: string) =>
  (filePath: PathLike): Promise<unknown> =>
    parseFile(filePath, `"${name}" is not valid, please specify a file or use inline JSON.`)

/**
 * @name getPrettierConfig
 * @description
 * Locate a `prettierrc[.js?on]` file or locate a prettier config defined in the root package.json.
 */
export const getPrettierConfig = async (
  rootPath: string,
  prettierConfigPath?: string,
  verbose?: boolean,
): Promise<PathLike[] | void> => {
  const rootPrettierrcFile = await findFile(rootPath, 'prettierrc', verbose)

  let prettierConfig: PathLike[] | void

  if (prettierConfigPath || rootPrettierrcFile) {
    const prettierPath = prettierConfigPath ?? rootPrettierrcFile ?? ''

    try {
      const prettierParser = parseConfig('--prettierConfig')

      prettierConfig = (await prettierParser(prettierPath)) as PathLike[]
    } catch {
      prettierConfig = void 0
    }
  } else {
    const pkg = JSON.parse(await readFile(join(rootPath, 'package.json'), 'utf8'))

    if (verbose) {
      logger.info(chalk.blue('...checking package.json for Prettier configuration'))
    }

    // eslint-disable-next-line dot-notation
    prettierConfig = pkg['prettier'] ?? null

    if (prettierConfig && verbose) {
      logger.info(chalk.blue('...found Prettier configuration in package.json'))
    }
  }

  if (!prettierConfig && verbose) {
    logger.warn(
      chalk.yellow('...no Prettier configuration was found. Default settings will be applied.'),
    )
  }

  return prettierConfig
}
