// const test = require('ava')
const e2k = require('..')



// test('description', t => {
//   t.is(true, true)
// })

const Koa = require('koa')
const app = new Koa

app.use(e2k((req, res, next) => {
  res.end('haha')
}))

app.listen(8889)
