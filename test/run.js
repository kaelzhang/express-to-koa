const supertest = require('supertest')
const {CONTEXT} = require('../src')

const wrapKoa = c => {
  c.koa = true
  return c
}

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
  }],

  ['post', '/post7', (req, res, next) => {
    res.statusCode = 201
    next()
  }, (req, res) => {
    res.end(String(res.statusCode))
  }],

  wrapKoa(
    ['post', '/post/:lang', (req, res) => {
      res.end(JSON.stringify(req[CONTEXT].params))
    }]
  )
]


const CASES = [
  ['get', '/get', 'get'],
  ['get', '/get2', 'get2'],
  ['post', '/post', 'post'],
  ['post', '/post2', 'post2', 201],
  ['post', '/post3', 'post3', 200],
  ['post', '/post4', 'post4', 201],
  ['post', '/post5', 'Internal Server Error', 500],
  ['post', '/post6', '200', 200],
  ['post', '/post7', '201', 201],
  wrapKoa(
    ['post', '/post/en', '{"lang":"en"}', 200]
  )
]

module.exports = (test, prefix, router, app, wrapper) => {
  let request

  const shouldSkip = c => c.koa && prefix === 'express'

  test.before(t => {
    ROUTES.forEach(c => {
      if (shouldSkip(c)) {
        return
      }

      const [method, pathname, ...middlewares] = c

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

  CASES.forEach(c => {
    if (shouldSkip(c)) {
      return
    }

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
