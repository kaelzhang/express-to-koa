const test = require('ava')
const Koa = require('koa')
const Router = require('koa-router')

const e2k = require('../src')
const run = require('./run')

const app = new Koa
const router = new Router()

app.use(router.routes())

run(test, 'koa', app, router, app.callback(), e2k)




