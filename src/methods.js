import { METHODS } from 'http'

export default METHODS.reduce((methods, method) => {
  if (method === 'DELETE') {
    methods[method] = 'del'
  } else {
    methods[method] = method.toLowerCase()
  }
  return methods
}, {})
