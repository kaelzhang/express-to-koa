"use strict";

var properties = {
  statusCode: {
    get: function get() {
      return this._response.statusCode;
    },
    set: function set(code) {
      this._response.statusCode = code;
    }
  },

  writeHead: {
    value: function value() {
      var _response;
      (_response = this._response).writeHead.apply(_response, arguments);
    }
  },

  write: {
    value: function value() {
      var _response2;

      // Koa and Koa2 set the statusCode to `404` by default.
      // So we must do something as well as `ctx.body = body`.
      if (!this._explicitStatus) {
        // set to _response.statusCode
        this.statusCode = 200;
      }

      return (_response2 = this._response).write.apply(_response2, arguments);
    }
  },

  end: {
    value: function value() {
      var _response3;

      if (!this._explicitStatus) {
        this.statusCode = 200;
      }

      return (_response3 = this._response).end.apply(_response3, arguments);
    }
  }
};

function makeResponse(res) {
  return Object.create({
    __proto__: res,
    _response: res,

  }, properties);
}

function wrap(ctx, middleware, next) {
  return new Promise(function (resolve, reject) {
    middleware(ctx.req, makeResponse(ctx.res), function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(next());
    });
  });
}

module.exports = function e2k(middleware) {
  return function (ctx, next) {
    return wrap(ctx, middleware, next);
  };
};
