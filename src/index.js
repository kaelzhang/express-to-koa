const symbol = key => Symbol(`express-to-koa:${key}`)

const STATUS_SET_EXPLICITLY = symbol('is-status-set-explicitly')
const CONTEXT = symbol('context')
const STATUS_CODE = symbol('status')
const ARGUMENTED = symbol('argumented')
const WRITE_HEAD = symbol('write-head')
const UNDEFINED = undefined

const markExplicitStatus = self => {
  const context = self[CONTEXT]
  if (context) {
    context._explicitStatus = true
  }
}

const BASE_RESPONSE_PROPERTIES = {
  [ARGUMENTED]: {
    value: true
  },

  statusCode: {
    get () {
      const context = this[CONTEXT]
      return !context || context._explicitStatus
        ? this[STATUS_CODE]
        // The default statusCode of http server is `200`
        : 200
    },

    set (code) {
      markExplicitStatus(this)
      this[STATUS_CODE] = code
    }
  },

  writeHead: {
    // We allow other middlewares to modify the response object
    writable: true,
    value (...args) {
      markExplicitStatus(this)
      return this[WRITE_HEAD].apply(this, args)
    }
  }
}

// 1.
// At the beginning
// koa set ctx.req.statusCode = 404 first
// but ctx._explicitStatus === undefined
// 2.
// run connect/express middlewares
// - the initial statusCode should be 200 for both http.createServer and express
// - if the
// 3.
// after all
// if body == null, res.end(statusToMessage(ctx.req.statusCode))

// const RESPONSE_PROPERTIES = ctx => {
//   const {
//     res
//   } = ctx

//   const {
//     writeHead,
//     end,
//     statusCode
//   } = res

//   return {
//     ...BASE_RESPONSE_PROPERTIES,

//     [STATUS_CODE]: {
//       writable: true,
//       value: statusCode
//     }
//   }
// }

// We HAVE to manipulate the vanilla OutGoing response instead of prototype,
// otherwise, if the response is piped, the request will stuck and hang

// Further research is required to figure out why.
const makeResponse = ctx => {
  const {res} = ctx

  res[CONTEXT] = ctx

  // Never redefine properties
  if (!res[ARGUMENTED]) {
    const {
      statusCode,
      writeHead
    } = res

    Object.defineProperties(res, BASE_RESPONSE_PROPERTIES)

    res[STATUS_CODE] = statusCode
    res[WRITE_HEAD] = writeHead
  }

  return res
}

const cleanResponseContext = ctx => {
  delete ctx.res[CONTEXT]
}

const wrap = (ctx, middleware, next) => new Promise((resolve, reject) => {
  middleware(ctx.req, makeResponse(ctx), err => {
    // We need to clean [CONTEXT] to prevent memleak
    cleanResponseContext(ctx)

    if (err) {
      reject(err)
      return
    }

    // #2
    if (!next) {
      return resolve()
    }

    resolve(next())
  })
})

module.exports = middleware => (ctx, next) => wrap(ctx, middleware, next)
