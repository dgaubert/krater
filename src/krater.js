import pathToRegexp from 'path-to-regexp'
import compose from 'koa-compose'
import methods from './methods'
import safeDecodeURIComponent from './safe-decode-uri-component'

export default class Krater {
  constructor () {
    this.hooks = []
  }

  hook (hooks) {
    if (!Array.isArray(hooks)) {
      hooks = [ hooks ]
    }

    this.hooks.push(...hooks)

    return this
  }

  path (path) {
    this.regexp = pathToRegexp(path)
    return this
  }

  match (path) {
    return this.regexp.test(path)
  }

  params (path) {
    const captures = this.regexp.exec(path).slice(1)
    const parameters = this.regexp.keys.reduce((params, placeholder, index) => {
      params[placeholder.name] = safeDecodeURIComponent(captures[index])
      return params
    }, {})

    return parameters
  }

  regist (app) {
    if (this.regexp === undefined) {
      throw new Error('Missing path to route requests')
    }

    app.use(this.route())

    return this
  }

  route () {
    return async (ctx, next) => {
      if (this.match(ctx.path)) {
        const handler = this[methods[ctx.method]]

        ctx.assert(typeof handler === 'function', 405)
        ctx.params = this.params(ctx.path)

        // bind handler context to use injected dependencies
        let middlewares = handler.call(this)

        if (!Array.isArray(middlewares)) {
          middlewares = [ middlewares ]
        }

        if (this.hooks.length) {
          middlewares.unshift(...this.hooks)
        }

        middlewares = compose(middlewares)

        await middlewares.call(this, ctx, next)
      } else {
        await next()
      }
    }
  }
}
