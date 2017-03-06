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
      // Koa and Koa2 set the statusCode to `404` by default.
      // So we must do something as well as `ctx.body = body`.
      if (!this._explicitStatus) {
        // set to _response.statusCode
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
