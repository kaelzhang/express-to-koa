const STATUS_SET_EXPLICITLY = Symbol('is-status-set-explicitly')
const CONTEXT = Symbol('koa-context')

const PROPERTIES = {
  [STATUS_SET_EXPLICITLY]: {
    get () {
      return this._response[STATUS_SET_EXPLICITLY]
    },

    set (value) {
      this._response[STATUS_SET_EXPLICITLY] = value
    }
  },

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

const makeRequest = ctx => Object.create({
  __proto__: ctx.req,
  [CONTEXT]: ctx
})

const makeResponse = ctx => Object.create({
  __proto__: ctx.res,
  _response: ctx.res,
  [CONTEXT]: ctx
}, PROPERTIES)

function wrap (ctx, middleware, next) {
  return new Promise((resolve, reject) => {
    middleware(makeRequest(ctx), makeResponse(ctx), err => {
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

module.exports.CONTEXT = CONTEXT
