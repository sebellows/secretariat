export const isNil = (obj: unknown): boolean => obj === undefined || obj === null
export const isDefined = (obj: unknown): boolean => obj !== undefined && obj !== null

export const isObject = (obj: unknown): boolean => typeof obj === 'object'

export const typeOf = (obj: unknown, is?: string): string | boolean => {
  const type = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()

  return is ? type === is : type
}

export const isPlainObject = (obj: unknown): boolean => typeOf(obj, 'object') as boolean
