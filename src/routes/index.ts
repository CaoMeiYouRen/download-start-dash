import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { env } from 'hono/adapter'
import slugify from 'slugify'
import { Bindings } from '../types'
import { DownloadRequest, EngineEnum } from '@/interfaces/download'
import { downloader } from '@/utils/downloader'
import logger from '@/middlewares/logger'

const app = new Hono<{ Bindings: Bindings }>()

app.use('/download/*', (c, next) => {
    if (c.env.AUTH_TOKEN) {
        return bearerAuth({ token: c.env.AUTH_TOKEN })(c, next)
    }
    return next()
})

app.post('/download', (c, next) => {
    if (c.env.AUTH_TOKEN) {
        return bearerAuth({ token: c.env.AUTH_TOKEN })(c, next)
    }
    return next()
}, async (c) => {
    const { BASE_URL } = env(c)
    const body = await c.req.json<DownloadRequest>()
    logger.debug('下载请求 %O', body)
    const { url, playlist, callback, name, sync } = body
    let engine = body.engine || 'auto'
    // const name = slugify(body.name || '', '_') // 获取 url 友好的名称
    if (!engine || engine === 'auto') {
        engine = EngineEnum.YOU_GET
    }
    if (sync) {
        const { success, downloads } = await downloader({ engine, url, name, playlist }, BASE_URL)
        return c.json({ success, downloads, sync: true })
    }
    downloader({ engine, url, name, playlist }, BASE_URL).then(({ success, downloads }) => {
        if (callback) {
            fetch(callback, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ success, downloads, async: true }),
            })
        }
    })
    return c.json({ success: true, downloads: [], async: true })
})

export default app
