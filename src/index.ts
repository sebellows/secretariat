import { writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import esbuild from 'esbuild'
import { globby } from 'globby'

import { logger } from './logger'
import { BuilderOptions } from './types'
import { handleBuildError } from './utils/fs'

async function _findEntryPoints(root: string) {
  const files = await globby([resolve(root, `**/*.ts`), resolve(root, `**/*.tsx`)])

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
  args: BuilderOptions
): Promise<esbuild.BuildOptions | undefined> {
  // eslint-disable-next-line prefer-const
  let { entryPoints, format, outdir, root, ...rest } = args

  if (!entryPoints && root) {
    entryPoints = await _findEntryPoints(root)
  }

  if (!outdir && !rest.outfile) {
    logger.warn('generateConfig', 'no outdir specified', outdir, entryPoints, rest)

    return undefined
  }

  return {
    format: format as esbuild.Format,
    target: 'esnext',
    platform: 'node',
    bundle: false,
    outdir,
    sourcemap: false,
    loader: { '.js': 'jsx' },
    entryPoints,
    ...rest,
  }
}

export async function build(args: BuilderOptions): Promise<void | esbuild.BuildResult> {
  const options = await generateConfig(args)

  if (options) {
    return esbuild.build(options)
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
  formatArgs: Record<string, BuilderOptions>
): Promise<(void | esbuild.BuildResult)[]> {
  const promises = Object.entries(formatArgs).map(async ([formatType, args]) => {
    return build({ format: formatType as esbuild.Format, ...args })
  })

  return Promise.all(promises)
}

interface BinFileParams {
  fileName: string
  filePath: string
  binDir: string
}

export const writeBinFile = async (params: BinFileParams): Promise<void> => {
  const { fileName, filePath, binDir } = params

  try {
    const outputPath = join(binDir, `${fileName}.js`)
    const tmpl = `#!/usr/bin/env node\n\nrequire('${filePath}');\n`

    writeFile(outputPath, tmpl)
  } catch (err: unknown) {
    setTimeout(() => {
      handleBuildError(`File "bin/${filePath}" does not exist.`)
    })
  }
}
