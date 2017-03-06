[![Build Status](https://travis-ci.org/kaelzhang/express-to-koa.svg?branch=master)](https://travis-ci.org/kaelzhang/express-to-koa)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/express-to-koa?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/express-to-koa)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/express-to-koa.svg)](http://badge.fury.io/js/express-to-koa)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/express-to-koa.svg)](https://www.npmjs.org/package/express-to-koa)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/express-to-koa.svg)](https://david-dm.org/kaelzhang/express-to-koa)
-->

# express-to-koa

Use express middlewares in Koa2, the one that really works.

- fixes the unexpected 404 status

## Install

```sh
$ npm install express-to-koa --save
```

## Usage

```js
const e2k = require('express-to-koa')
const app = new Koa()
app.use(e2k(expressMiddleware))
```

## License

MIT
