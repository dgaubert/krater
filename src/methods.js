import { METHODS } from 'http'

export default METHODS.reduce((methods, method) => {
  if (method === 'DELETE') {
    methods[method] = 'del'
  } else if (method !== 'CONNECT') {
    // proxy-chaining and tunneling out of scope
    // see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/CONNECT
    methods[method] = method.toLowerCase()
  }
  return methods
}, {})
