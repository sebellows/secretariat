import chalk from 'chalk'

const logger =
  (
    method: keyof Console,
    type: string,
    color: (str: string) => string
  ): ((...msgs: unknown[]) => void) =>
  (...messages: unknown[]) => {
    console[method](color(chalk.bold(type)), ...messages)
  }

logger.log = logger('log', '✏︎', chalk.white)
logger.error = logger('error', '✖', chalk.red)
logger.info = logger('info', 'ℹ', chalk.blue)
logger.success = logger('log', '✔', chalk.green)
logger.warn = logger('warn', '⚠', chalk.yellow)

logger.exit = (...messages: unknown[]) => {
  logger.error(...messages)
  // eslint-disable-next-line no-process-exit
  process.exit(1)
}

export { logger }
