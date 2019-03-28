const supertest = require('supertest')

const ROUTES = [
  ['get', '/get', (req, res, next) => {
    res.end('get')
  }],

  ['get', '/get2', (req, res) => {
    res.end('get2')
  }],

  ['post', '/post', (req, res, next) => {
    next()
  }],

  ['post', '/post', (req, res, next) => {
    res.end('post')
  }],

  ['post', '/post2', (req, res, next) => {
    res.statusCode = 201
    res.end('post2')
  }],

  ['post', '/post3', (req, res, next) => {
    // #1
    const code = res.statusCode
    res.statusCode = code || 200
    res.end('post3')
  }],

  ['post', '/post4', (req, res) => {
    res.writeHead(201)
    res.end('post4')
  }],

  ['post', '/post5', (req, res, next) => {
    next(new Error('post5'))
  }],

  ['post', '/post6', (req, res) => {
    res.end(String(res.statusCode))
  }]
]


const CASES = [
  ['get', '/get', 'get'],
  ['get', '/get2', 'get2'],
  ['post', '/post', 'post'],
  ['post', '/post2', 'post2', 201],
  ['post', '/post3', 'post3', 200],
  ['post', '/post4', 'post4', 201],
  ['post', '/post5', 'Internal Server Error', 500],
  ['post', '/post6', '200', 200]
]

module.exports = (test, prefix, router, app, wrapper) => {
  let request

  test.before(t => {
    ROUTES.forEach(([method, pathname, ...middlewares]) => {
      middlewares.forEach(middleware => {
        router[method](
          pathname,
          wrapper
            ? wrapper(middleware)
            : middleware
        )
      })
    })

    request = supertest(app)
  })

  CASES.forEach((c) => {
    test(`${prefix}: ${c.join(', ')}`, async t => {
      const [
        method,
        pathname,
        body,
        code = 200
      ] = c

      const {
        status,
        text
      } = await request[method](pathname)

      t.is(status, code)

      if (code !== 500) {
        t.is(text, body)
      }
    })
  })
}
