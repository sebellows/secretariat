import { writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import esbuild from 'esbuild'
import { globby } from 'globby'

import { BASE_PATH, BIN_PATH } from './const'
import { logger } from './logger'
import { BuilderOptions } from './types'
import { handleBuildError, resolveDir } from './utils/fs'

async function _findEntryPoints(root: string) {
  const files = await globby([resolve(root, `src/**/*.ts`)])

  return files.filter((file) => {
    return (
      !file.includes('__fixtures__') &&
      !file.endsWith('.stories.tsx') &&
      !file.endsWith('.test.ts') &&
      !file.endsWith('.test.tsx')
    )
  })
}

export async function generateConfig(
  args: BuilderOptions,
): Promise<esbuild.BuildOptions | undefined> {
  // eslint-disable-next-line prefer-const
  let { entryPoints, format, outdir, root, ...rest } = args
  // console.log('generateConfig', args)
  // process.exit(1)

  if (!entryPoints && root) {
    entryPoints = await _findEntryPoints(root)
  }

  if (!outdir && !rest.outfile) {
    logger.warn('generateConfig', 'no outdir specified', outdir, entryPoints, rest)

    return undefined
  }

  return {
    format: format as esbuild.Format,
    target: 'node12.20',
    platform: 'node',
    bundle: true,
    outdir,
    sourcemap: false,
    loader: { '.ts': 'ts' },
    entryPoints,
    external: ['fs', 'fs/promises', 'path'],
    ...rest,
  }
}

export async function build(args: BuilderOptions): Promise<void | esbuild.BuildResult> {
  const options = await generateConfig(args)

  if (options) {
    return esbuild.build(options)
  } else {
    logger.exit("No configuration options were passed to ESBuild's `build` function.")
  }
}

/**
 * Build all formats via configuration.
 *
 * @example
 * await buildAll(
 *   {
 *     cjs: {
 *       outdir: 'dist/commonjs',
 *       target: 'es2015'
 *     }
 *     esm: {
 *       outdir: 'dist/module',
 *       target: 'es2015'
 *     }
 *   }`
 */
export async function buildAll(
  formatArgs: Record<string, BuilderOptions>,
): Promise<(void | esbuild.BuildResult)[]> {
  const promises = Object.entries(formatArgs).map(async ([formatType, args]) => {
    return build({ format: formatType as esbuild.Format, ...args })
  })

  return Promise.all(promises)
}

export interface BinFileParams {
  fileName?: string
  filePath?: string
}

export const writeBinFile = async (params: BinFileParams): Promise<void> => {
  const { fileName, filePath } = params
  const binPath = resolve(BASE_PATH, BIN_PATH)
  const normalizedFileName = fileName?.endsWith('.js') ? fileName : `${fileName}.js`

  try {
    const binFilePath = await resolveDir(binPath)
    const tmpl = `#!/usr/bin/env node\n\nrequire('${filePath}');\n`

    writeFile(join(binFilePath, normalizedFileName), tmpl)
  } catch (err: unknown) {
    setTimeout(() => {
      handleBuildError(`File "bin/${filePath}" does not exist.`)
    })
  }
}
