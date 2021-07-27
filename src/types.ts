import { BuildOptions as EsBuildOptions } from 'esbuild'

export type Log = (message: string) => void

export type InputArgs = Pick<EsBuildOptions, 'outdir'> & {
  // used for locating entryPoint files.
  root?: string
  format?: string | EsBuildOptions['format']
}

export type BuilderOptions = Partial<Omit<EsBuildOptions, 'sourcemap'>> & InputArgs
