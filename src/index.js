const STATUS_SET_EXPLICITLY = Symbol('is-status-set-explicitly')
const STATUS_CODE = Symbol('status-code')
const CONTEXT = Symbol('koa-context')
const ARGUMENTED = Symbol('argumented')

const REQUEST_PROPERTIES = ctx => ({
  [ARGUMENTED]: {
    value: true
  },

  [CONTEXT]: {
    value: ctx
  }
})

const BASE_RESPONSE_PROPERTIES = {
  [ARGUMENTED]: {
    value: true
  },

  [STATUS_SET_EXPLICITLY]: {
    writable: true
  },

  statusCode: {
    get () {
      return this[STATUS_SET_EXPLICITLY]
        ? this[STATUS_CODE]
        // The default statusCode of express is `200`
        : 200
    },

    set (code) {
      this[STATUS_SET_EXPLICITLY] = true
      this[STATUS_CODE] = code
    }
  }
}

const RESPONSE_PROPERTIES = ctx => {
  const {
    res
  } = ctx

  const {
    writeHead,
    end,
    statusCode
  } = res

  return {
    ...BASE_RESPONSE_PROPERTIES,

    [CONTEXT]: {
      value: ctx
    },

    [STATUS_CODE]: {
      writable: true,
      value: statusCode
    },

    writeHead: {
      // We allow other middlewares to modify the response object
      writable: true,
      value (...args) {
        this[STATUS_SET_EXPLICITLY] = true
        return writeHead.apply(this, args)
      }
    },

    end: {
      writable: true,
      value (...args) {
        // Koa and Koa2 set the statusCode to `404` by default.
        // So we must do something as well as `ctx.body = body`.
        if (!this[STATUS_SET_EXPLICITLY]) {
          // set to _response.statusCode
          this.statusCode = 200
        }

        return end.apply(this, args)
      }
    }
  }
}

const define = (host, props) => {
  // NEVER redefine properties
  if (host[ARGUMENTED]) {
    return host
  }

  return Object.defineProperties(host, props)
}

const makeRequest = ctx => define(
  ctx.req,
  REQUEST_PROPERTIES(ctx)
)

// We HAVE to manipulate the vanilla OutGoing response,
// otherwise, if the response is piped, the request will stuck and hang

// Further research is required to figure out why.
const makeResponse = (ctx, resolve) => define(
  ctx.res,
  RESPONSE_PROPERTIES(ctx, resolve)
)

const wrap = (ctx, middleware, next) => new Promise((resolve, reject) => {
  middleware(makeRequest(ctx), makeResponse(ctx), err => {
    if (err) {
      reject(err)
      return
    }

    resolve(next())
  })
})

module.exports = middleware => (ctx, next) => wrap(ctx, middleware, next)

Object.defineProperty(module.exports, 'CONTEXT', {
  value: CONTEXT
})
