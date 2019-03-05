const properties = {
  write: {
    value (...args) {
      // Koa and Koa2 set the statusCode to `404` by default.
      // So we must do something as well as `ctx.body = body`.
      if (!this._explicitStatus) {
        // set to _response.statusCode
        this.statusCode = 200
      }

      return this._response.write(...args)
    }
  },

  end: {
    value (...args) {
      if (!this._explicitStatus) {
        this.statusCode = 200
      }

      return this._response.end(...args)
    }
  }
}


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
