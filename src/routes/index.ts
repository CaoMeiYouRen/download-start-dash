import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { env } from 'hono/adapter'
import slugify from 'slugify'
import { Bindings } from '../types'
import { DownloadRequest, EngineEnum } from '@/interfaces/download'
import { downloader } from '@/utils/downloader'
import logger from '@/middlewares/logger'

const app = new Hono<{ Bindings: Bindings }>()

app.use('/download*', (c, next) => {
    if (c.env.AUTH_TOKEN) {
        return bearerAuth({ token: c.env.AUTH_TOKEN })(c, next)
    }
    return next()
})

app.post('/download', async (c) => {
    const { BASE_URL } = env(c)
    const body = await c.req.json<DownloadRequest>()
    logger.debug('下载请求 %O', body)
    const { url, playlist, callback } = body
    let engine = body.engine || 'auto'
    const name = slugify(body.name || '', '_') // 获取 url 友好的名称
    if (!engine || engine === 'auto') {
        engine = EngineEnum.YOU_GET
    }
    const success = await downloader({ engine, url, name, playlist })
    const downloadUrl = new URL(`/download/${name}`, BASE_URL).toString()
    if (callback) {
        await fetch(callback, {
            method: 'POST',
            body: JSON.stringify({ success, url, name, playlist, downloadUrl }),
        })
    }
    return c.json({ success, url, name, playlist, downloadUrl })
})

export default app
