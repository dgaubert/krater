import pathToRegexp from 'path-to-regexp'
import compose from 'koa-compose'
import methods from './methods'
import safeDecodeURIComponent from './safe-decode-uri-component'

export default class Krater {
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

        let middleware = handler.call(this)

        if (Array.isArray(middleware)) {
          middleware = compose(middleware)
        }

        await middleware.call(this, ctx, next)
      } else {
        await next()
      }
    }
  }
}
