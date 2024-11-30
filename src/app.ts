import { Hono } from 'hono'
import { timeout } from 'hono/timeout'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { showRoutes } from 'hono/dev'
import { env, getRuntimeKey } from 'hono/adapter'
import { bodyLimit } from 'hono/body-limit'
import { requestId } from 'hono/request-id'
import fs from 'fs-extra'
import { to } from 'await-to-js'
import { __DEV__, COOKIE_CLOUD_PASSWORD, COOKIE_CLOUD_URL, COOKIES_PATH, DATA_PATH, DOWNLOAD_PATH } from './env'
import logger, { loggerMiddleware } from './middlewares/logger'
import { errorhandler, notFoundHandler } from './middlewares/error'
import { Bindings } from './types'
import routes from './routes'
import { checkEngines } from './utils/check'
import { cloudCookie2File, getCloudCookie } from './utils/cookie'

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
if (COOKIE_CLOUD_URL) {
    setTimeout(async () => {
        checkEngines()
        logger.info('正在获取 Cookie')
        const [cookieError, data] = await to(getCloudCookie(COOKIE_CLOUD_URL, COOKIE_CLOUD_PASSWORD))
        if (cookieError) {
            logger.error('获取 Cookie失败！\n', cookieError.stack)
        } else if (data) {
            await cloudCookie2File(data)
            logger.info('获取 Cookie 成功')
        }
    }, 0)
}

export default app
