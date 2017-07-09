import assert from 'assert'
import fetch from 'node-fetch'
import { default as Router } from '../src'
import methods from '../src/methods'
import Koa from 'koa'

class User extends Router {
  get () {
    return ctx => {
      ctx.body = ctx.params[0]
    }
  }
}

const USER = 'foo'

Object.keys(methods).forEach(function (key) {
  const method = methods[key]

  describe('route.' + method + '()', function () {
    before(function (done) {
      const app = new Koa()
      const user = new User()
      user.path(`/:user(${USER})`).regist(app)

      this.httpServer = app.listen(3000)

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
        const res = await fetch(`http://localhost:${this.port}/${USER}`)
        const body = await res.text()

        assert.ok(res.ok)
        assert.equal(res.status, 200)
        assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8')
        assert.equal(body, USER)
      })
    })

    describe('when only method matches', function () {
      it('should 404', async function () {
        const res = await fetch(`http://localhost:${this.port}/bar`)

        assert.ok(!res.ok)
        assert.equal(res.status, 404)
      })
    })
  })
})
