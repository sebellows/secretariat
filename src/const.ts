import { join } from 'path'

/** The path to this root level directory (for `scripts`). */
export const BASE_PATH = join(__dirname)

/** The path to the root directory of the Indigo repository (from `bin/lib`). */
export const ROOT_PATH = process.cwd()
