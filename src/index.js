// const delegate = require('delegates')

const properties = {
  statusCode: {
    get () {
      return this._response.statusCode
    },

    set (code) {
      this._explicitStatus = true
      this._response.statusCode = code
    }
  },

  end: {
    value (...args) {
      if (!this._explicitStatus) {
        // set to _response.statusCode
        this.statusCode = 200
      }

      return this._response.end(...args)
    }
  }
}

// delegate(proto, '_response')
// .method('on')
// .method('emit')
// .method('addTrailers')
// // .method('end')
// .getter('finished')
// .method('getHeader')
// .method('getHeaderNames')
// .method('getHeaders')
// .method('hasHeader')
// .getter('headerSent')
// .method('removeHeader')
// .method('sendDate')
// .method('sentHeader')
// .method('setTimeout')
// // .access('statusCode')
// // .access('statusMessage')
// .method('write')
// .method('writeContinue')
// .method('writeHead')


function makeResponse (res) {
  return Object.create({
    __proto__: res,
    _response: res
  }, properties)
}


function wrap (ctx, middleware, next) {
  return new Promise((resolve, reject) => {
    middleware(ctx.req, makeResponse(ctx.res), err => {
      if (err) {
        reject(err)
        return
      }

      resolve(next())
    })
  })
}


module.exports = function e2k (middleware) {
  return (ctx, next) => wrap(ctx, middleware, next)
}
