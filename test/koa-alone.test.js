const test = require('ava')
const Koa = require('koa')
const supertest = require('supertest')

const e2k = require('../src')

test('#2', async t => {
  const app = new Koa
  const m = ctx => e2k((req, res, next) => {
    next()
  })(ctx)

  app.use(m)

  const request = supertest(app.callback())

  const {
    statusCode,
    text
  } = await request.get('/not-found')

  t.is(statusCode, 404)
})
