import { join } from 'path'

/** The path to the current `src` directory. */
export const BASE_PATH = join(__dirname)

/** The path to the project's root directory. */
export const ROOT_PATH = process.cwd()

/** Relative path to bin directory where compiled command scripts go. */
export const BIN_PATH = '../bin'

/** Relative path to the directory where the compiled code is placed. */
export const OUTPUT_PATH = '../lib'
