import assert from 'assert'
import { default as Router } from '../src/krater'

describe('params', function () {
  const scenarios = [
    {
      regexp: '/:user',
      path: '/foo',
      params: {
        user: 'foo'
      }
    },
    {
      regexp: '/:user/:role',
      path: '/foo/bar',
      params: {
        user: 'foo',
        role: 'bar'
      }
    },
    {
      regexp: '/user/:user',
      path: '/user/foo',
      params: {
        user: 'foo'
      }
    },
    {
      regexp: 'user/:user/role/:role',
      path: 'user/foo/role/bar',
      params: {
        user: 'foo',
        role: 'bar'
      }
    },
    {
      regexp: 'user/:user(\\w+)/id/:id(\\d+)',
      path: 'user/foo/id/1',
      params: {
        user: 'foo',
        id: '1'
      }
    },
    {
      regexp: 'user/:user',
      path: 'user/шеллы',
      params: {
        user: 'шеллы'
      }
    },
    {
      regexp: 'user/:user',
      path: 'user/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B',
      params: {
        user: 'шеллы'
      }
    }
  ]

  beforeEach(function () {
    this.router = new Router()
  })

  scenarios.forEach(({ regexp, path, params }) => {
    it(`"${path}" should match "${regexp}" and return ${JSON.stringify(params)}`, function () {
      this.router.path(regexp)

      const parameters = this.router.params(path)

      assert.deepEqual(parameters, params)
    })
  })
})
