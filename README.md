[![Build Status](https://travis-ci.org/kaelzhang/express-to-koa.svg?branch=master)](https://travis-ci.org/kaelzhang/express-to-koa)
[![Coverage](https://codecov.io/gh/kaelzhang/express-to-koa/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/express-to-koa)

<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/express-to-koa?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/express-to-koa)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/express-to-koa.svg)](https://www.npmjs.org/package/express-to-koa)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/express-to-koa.svg)](https://david-dm.org/kaelzhang/express-to-koa)
-->

# express-to-koa

Use express middlewares in Koa2 (not support koa1 for now), the one that **REALLY WORKS**.

- Handle koa2 http status code, which fixes the common issue that we always get 404 with [koa-connect](https://www.npmjs.com/package/koa-connect)
- Handle express middlewares that contains `.pipe(res)`, such as `express.static` which based on [`send`](https://www.npmjs.com/package/send)

## Usage

```js
const e2k = require('express-to-koa')

// Some express middleware
const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath,
  quiet: true
})

const app = new Koa()
app.use(e2k(devMiddleware))
```

## What Kind of Express Middlewares are Supported?

NEARLY **ALL** express middlewares built with best practices.

**TL;NR**

`express-to-koa` does not support all arbitrary express middlewares, but only for those who only uses **Express-Independent** APIs like `res.write` and `res.end`, i.e. the APIs that node [http.ServerResponse](https://nodejs.org/dist/latest-v7.x/docs/api/http.html#http_class_http_serverresponse) provides.

However, if a middleware uses APIs like `res.send` or something, `express-to-koa` will do far too much work to convert those logic to koa2, which is not easier than creating both express and koa2 from 0 to 1.

So, it is a good practice to write framework-agnostic middlewares or libraries.

## Supported Middlewares

- [webpack-dev-middleware](https://www.npmjs.com/package/webpack-dev-middleware)
- [webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware)
- [next.getRequestHandler()](https://github.com/zeit/next.js/#custom-server-and-routing)
- Other middlewares which are waiting for you to add to the README. Any contributions are welcome.

## e2k.CONTEXT

```js
const {
  CONTEXT
} = require('express-to-koa')

app.use(e2k(
  (req, res) => {
    // We can access koa context by
    req[CONTEXT]

    // Or
    res[CONTEXT]
  }
))
```

## License

MIT
