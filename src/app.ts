import { Hono } from 'hono'
import { timeout } from 'hono/timeout'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { showRoutes } from 'hono/dev'
import { env, getRuntimeKey } from 'hono/adapter'
import { bodyLimit } from 'hono/body-limit'
import { requestId } from 'hono/request-id'
import fs from 'fs-extra'
import { __DEV__, COOKIE_CLOUD_URL, COOKIES_PATH, DATA_PATH, DOWNLOAD_PATH, PROXY_URL } from './env'
import logger, { loggerMiddleware } from './middlewares/logger'
import { errorhandler, notFoundHandler } from './middlewares/error'
import { Bindings } from './types'
import routes from './routes'
import { checkEngines } from './utils/check'
import { syncCloudCookie } from './utils/cookie'
import { timer } from './utils/timer'

const app = new Hono<{ Bindings: Bindings }>()

app.use(requestId())
app.use(loggerMiddleware)
app.use((c, next) => {
    const TIMEOUT = parseInt(env(c).TIMEOUT) || 60000
    return timeout(TIMEOUT)(c, next)
})
app.use((c, next) => {
    const MAX_BODY_SIZE = parseInt(env(c).MAX_BODY_SIZE) || 100 * 1024 * 1024 // 默认 100MB
    return bodyLimit({ maxSize: MAX_BODY_SIZE })(c, next)
})

app.use(cors())
app.use(secureHeaders())

app.onError(errorhandler)
app.notFound(notFoundHandler)

app.all('/', (c) => c.json({
    message: 'Hello Hono!',
}))

app.all('/runtime', (c) => c.json({
    runtime: getRuntimeKey(),
    nodeVersion: process.version,
    requestId: c.get('requestId'),
}))

app.route('/', routes)

if (__DEV__) {
    showRoutes(app, {
        verbose: true,
    })

}

// 创建数据目录
await fs.ensureDir(DATA_PATH)
logger.info(`数据目录 ${DATA_PATH}`)
await fs.ensureDir(DOWNLOAD_PATH)
logger.info(`下载目录 ${DOWNLOAD_PATH}`)
await fs.ensureDir(COOKIES_PATH)
logger.info(`cookies 目录 ${COOKIES_PATH}`)

if (PROXY_URL) {
    logger.info(`代理地址 ${PROXY_URL}`)
}

checkEngines()

syncCloudCookie()
if (COOKIE_CLOUD_URL) {
    // 每小时同步一次
    timer('0 * * * *', syncCloudCookie)
}

export default app
