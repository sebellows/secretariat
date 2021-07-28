import { constants, statSync, PathLike } from 'fs'
import { access, mkdir, readdir, stat, writeFile } from 'fs/promises'
import { basename, join } from 'path'

import { logger } from '../logger'
import { InputArgs } from '../types'
import { isPlainObject } from './common'

/**
 * Display an error and exit the current process.
 */
export function handleBuildError(msg: unknown, err?: unknown): void {
  const isENOENT = isPlainObject(err) && (err as NodeJS.ErrnoException)?.code === 'ENOENT'
  const method = isENOENT ? 'error' : 'exit'

  logger[method](msg, err)
}

export const getRootDirectory = (): string => basename(process.cwd())

/**
 * @name pathExists
 * @description
 * There is not async version of `fs.existsSync()` and deprecation of `existsSync` fluctuates.
 */
export const pathExists = async (path: string): Promise<boolean> => {
  try {
    await access(path, constants.R_OK || constants.W_OK)

    return true
  } catch (err) {
    handleBuildError(`Invalid Path: ${path} does not exist.`, err)

    return false
  }
}

/**
 * @name resolveDir
 * @description
 * Make sure a path is valid and return it if it is, else throw an error.
 */
export const resolveDir = async (path: string): Promise<string> => {
  const rootDir = getRootDirectory()
  const dirPath = path.includes(rootDir) ? path : join(rootDir, path)

  try {
    const stats = await stat(dirPath)

    return stats.isDirectory() ? dirPath : path
  } catch (err) {
    if (path === '.') {
      handleBuildError(`Provided path points to Secretariat's root directory ("${path}").`, err)
    }

    logger.warn(`Unable to resolve directory of "${path}", so directory is being created...`)
    await mkdir(dirPath, { recursive: true })
    logger.info(`Directory "${path}" has been created.`)

    return dirPath
  }
}

/**
 * @name createDir
 * @description
 * Generate a new directory if the specified one does not exist.
 */
export const createDir = async (path: string | undefined): Promise<boolean> => {
  if (!path) return false

  try {
    await resolveDir(path)

    return true
  } catch (error: unknown) {
    handleBuildError(`Unable to create directory for --outDir at ${path}.\n${error}`)

    return false
  }
}

export const createFile = async (
  fileName: string,
  content: string,
  args: InputArgs,
): Promise<void> => {
  const { outdir } = args

  try {
    if (!outdir) {
      throw new Error('`outdir` was not supplied in args to `createFile`')
    }

    const created = await createDir(outdir)

    if (!created) {
      throw new Error('Could not write command file to bin/')
    }

    const filepath = join(__dirname, outdir, `${fileName}.js`)

    writeFile(filepath, content)
  } catch (error: unknown) {
    setTimeout(() => {
      handleBuildError(error)
    })
  }
}

export const getFileNames = async (dirPath: string): Promise<string[] | undefined> => {
  try {
    const files = await readdir(dirPath)

    return files
  } catch (err: unknown) {
    handleBuildError(`Unable to scan directory: ${err}`)

    return undefined
  }
}

/**
 * @name isFile
 * @description
 * Check if a file was actually passed.
 */
export const isFile = (filePath: PathLike, exitOnError = false): boolean => {
  try {
    const stats = statSync(filePath)

    return stats.isFile()
  } catch (error) {
    if (exitOnError) {
      handleBuildError(`File not found. ${filePath} does not lead to a valid file.\n${error}`)
    }

    return false
  }
}

/**
 * @name findFile
 * @description
 * Check if a file exists in a given directory.
 * If it does, return it's absolute path, otherwise return null.
 */
export const findFile = async (
  dirPath: string,
  entry: string,
  verbose = true,
): Promise<string | null> => {
  try {
    const files = await readdir(dirPath)
    let foundFile = null

    for await (const file of files) {
      if (file.includes(entry)) {
        foundFile = file
        break
      }
    }

    if (!foundFile && verbose) {
      logger.warn(`The file "${entry}" was not found...`)
    }

    return foundFile
  } catch (err) {
    handleBuildError(`Directory path ${dirPath} appears to be invalid.`, err)

    return null
  }
}

export const sortFilesImports = (files: Record<string, any>[]): void => {
  files.sort((a, b) => {
    if (a.componentName < b.componentName) {
      return -1
    }

    if (a.componentName > b.componentName) {
      return 1
    }

    return 0
  })
}

/**
 * @name allSettled
 * @description
 * Promise.allSettled polyfill
 *
 * TODO: remove after app drops support for iOS < 13 and Samsung's
 * mobile browser has added support.
 * Check MDN or caniuse for status updates after 2021 --sb
 * @see MDN {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled#browser_compatibility}
 * @see caniuse {@link https://caniuse.com/?search=allsettled}
 */
export const allSettled =
  // eslint-disable-next-line node/no-unsupported-features/es-builtins
  Promise.allSettled ||
  function <T extends unknown[] | [unknown] | Iterable<T> = unknown[]>(promises: T) {
    const mappedPromises = (promises as unknown[]).map((promise: unknown) => {
      return (promise as Promise<T>)
        .then((value) => {
          return {
            status: 'fulfilled',
            value,
          } as PromiseFulfilledResult<T>
        })
        .catch((reason) => {
          return {
            status: 'rejected',
            reason,
          } as PromiseRejectedResult
        })
    })

    return Promise.all(mappedPromises)
  }
