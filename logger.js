const bunyan = require('bunyan')
const { createNamespace } = require('cls-hooked')
const ns = createNamespace('ns')

let log = {
  trace: console.trace,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
  fatal: console.error,
  child: () => log
}

function getCurrentLogger () {
  return ns.get('logger') || log
}

module.exports = {
  trace: (...args) => getCurrentLogger().trace(...args),
  debug: (...args) => getCurrentLogger().debug(...args),
  info: (...args) => getCurrentLogger().info(...args),
  warn: (...args) => getCurrentLogger().warn(...args),
  error: (...args) => getCurrentLogger().error(...args),
  fatal: (...args) => getCurrentLogger().fatal(...args),

  createLogger (options) {
    log = bunyan.createLogger(options)
  },

  context (options, callback) {
    ns.run(() => {
      // Create a new logger based on "options"
      ns.set('logger', getCurrentLogger().child(options))
      callback()
    })
  }
}
