import assert from 'assert'
import fetch from 'node-fetch'
import { default as Router } from '../src/krater'
import methods from '../src/methods'
import Koa from 'koa'

const USER = 'foo'

Object.keys(methods).forEach(function (method) {
  const controllerMethod = methods[method]

  class User extends Router {
    [ controllerMethod ] () {
      return ctx => {
        ctx.body = ctx.params[0]
      }
    }
  }

  describe('route.' + controllerMethod + '()', function () {
    before(function (done) {
      const app = new Koa()
      const user = new User()

      user.path(`/:user(${USER})`).regist(app)

      this.httpServer = app.listen()

      this.httpServer.once('listening', () => {
        this.port = this.httpServer.address().port
        done()
      })
    })

    after(function (done) {
      this.httpServer.close(done)
    })

    describe('when method and path match', function () {
      it('should 200', async function () {
        const res = await fetch(`http://localhost:${this.port}/${USER}`, { method })
        const body = await res.text()

        assert.ok(res.ok, res.statusText)
        assert.equal(res.status, 200)
        assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8')

        if (method !== 'HEAD') {
          assert.equal(body, USER)
        }
      })
    })

    describe('when only method matches', function () {
      it('should 404', async function () {
        const res = await fetch(`http://localhost:${this.port}/bar`, { method })

        assert.ok(!res.ok, res.statusText)
        assert.equal(res.status, 404)
      })
    })
  })
})
