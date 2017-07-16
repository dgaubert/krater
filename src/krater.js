import pathToRegexp from 'path-to-regexp'
import compose from 'koa-compose'
import methods from './methods'
import safeDecodeURIComponent from './safe-decode-uri-component'

export default class Krater {
  constructor () {
    this.hooks = []
    this.handlers = {}
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

    Object.keys(methods).forEach(key => {
      const method = methods[key]
      const handler = this[method]

      if (typeof handler === 'function') {
        this.mount(method, handler)
      }
    })

    app.use(this.route())

    return this
  }

  mount (method, handler) {
    // bind handler context to use injected dependencies
    let middlewares = handler.call(this)

    if (!Array.isArray(middlewares)) {
      middlewares = [ middlewares ]
    }

    if (this.hooks.length) {
      middlewares.unshift(...this.hooks)
    }

    middlewares = compose(middlewares)

    this.handlers[method] = middlewares
  }

  route () {
    return async (ctx, next) => {
      if (this.match(ctx.path)) {
        const method = methods[ctx.method]
        const handler = this.handlers[method]

        ctx.assert(typeof handler === 'function', 405)
        ctx.params = this.params(ctx.path)

        await handler.call(this, ctx, next)
      } else {
        await next()
      }
    }
  }
}
