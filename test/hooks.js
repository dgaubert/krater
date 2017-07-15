import assert from 'assert'
import fetch from 'node-fetch'
import { default as Router } from '../src/krater'
import Koa from 'koa'

class User extends Router {
  get () {
    return async (ctx, next) => {
      if (ctx.body) {
        ctx.body += ctx.params.user
      } else {
        ctx.body = ctx.params.user
      }

      await next()
    }
  }
}

const USER = 'foo'

describe('hooks', function () {
  beforeEach(function (done) {
    this.app = new Koa()
    this.user = new User()

    this.user.path(`/:user(${USER})`)

    this.httpServer = this.app.listen()

    this.httpServer.once('listening', () => {
      this.port = this.httpServer.address().port
      done()
    })
  })

  afterEach(function (done) {
    this.httpServer.close(done)
  })

  it('should 200 with hook', async function () {
    this.user.hook(async (ctx, next) => {
      ctx.body = 'hello '
      await next()
    })
    this.user.regist(this.app)

    const res = await fetch(`http://localhost:${this.port}/${USER}`)
    const body = await res.text()

    assert.ok(res.ok, res.statusText)
    assert.equal(res.status, 200)
    assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8')
    assert.equal(body, `hello ${USER}`)
  })

  it('should 400 with pre hook', async function () {
    this.user.hook(async (ctx, next) => {
      ctx.throw(400)
      await next()
    })
    this.user.regist(this.app)

    const res = await fetch(`http://localhost:${this.port}/${USER}`)
    const body = await res.text()

    assert.ok(!res.ok, res.statusText)
    assert.equal(res.status, 400)
    assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8')
    assert.equal(body, 'Bad Request')
  })

  it('should 200 with post hook', async function () {
    this.user.hook(async (ctx, next) => {
      await next()
      ctx.body += '!!!'
    })

    this.user.regist(this.app)

    const res = await fetch(`http://localhost:${this.port}/${USER}`)
    const body = await res.text()

    assert.ok(res.ok, res.statusText)
    assert.equal(res.status, 200)
    assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8')
    assert.equal(body, `${USER}!!!`)
  })

  it('should 400 with post hook', async function () {
    this.user.hook(async (ctx, next) => {
      await next()
      ctx.throw(400)
    })

    this.user.regist(this.app)

    const res = await fetch(`http://localhost:${this.port}/${USER}`)
    const body = await res.text()

    assert.ok(!res.ok, res.statusText)
    assert.equal(res.status, 400)
    assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8')
    assert.equal(body, 'Bad Request')
  })

  it('should 200 with array of hooks', async function () {
    this.user.hook([
      async (ctx, next) => {
        ctx.body = 'hello '
        await next()
      },
      async (ctx, next) => {
        await next()
        ctx.body += '!!!'
      }
    ])
    this.user.regist(this.app)

    const res = await fetch(`http://localhost:${this.port}/${USER}`)
    const body = await res.text()

    assert.ok(res.ok, res.statusText)
    assert.equal(res.status, 200)
    assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8')
    assert.equal(body, `hello ${USER}!!!`)
  })
})
