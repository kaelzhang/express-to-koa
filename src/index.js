const STATUS_SET_EXPLICITLY = Symbol('is-status-set-explicitly')

const properties = {
  statusCode: {
    get () {
      return this[STATUS_SET_EXPLICITLY]
        ? this._response.statusCode
        // The default statusCode of express is `200`
        : 200
    },

    set (code) {
      this[STATUS_SET_EXPLICITLY] = true
      this._response.statusCode = code
    }
  },

  writeHead: {
    value (...args) {
      this[STATUS_SET_EXPLICITLY] = true
      this._response.writeHead(...args)
    }
  },

  end: {
    value (...args) {
      // Koa and Koa2 set the statusCode to `404` by default.
      // So we must do something as well as `ctx.body = body`.
      if (!this[STATUS_SET_EXPLICITLY]) {
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
    _response: res,
    [STATUS_SET_EXPLICITLY]: false
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
