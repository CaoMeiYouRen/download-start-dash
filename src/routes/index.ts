import path from 'path'
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { env } from 'hono/adapter'
import slugify from 'slugify'
import fs from 'fs-extra'
import { serveStatic } from '@hono/node-server/serve-static'
import { Bindings } from '../types'
import { DownloadRequest, EngineEnum } from '@/interfaces/download'
import { downloader } from '@/utils/downloader'
import logger from '@/middlewares/logger'
import { DOWNLOAD_PATH } from '@/env'

const app = new Hono<{ Bindings: Bindings }>()

app.on(['GET', 'POST', 'DELETE', 'PUT'], ['/download', '/download/*'], (c, next) => {
    if (c.env.AUTH_TOKEN) {
        return bearerAuth({ token: c.env.AUTH_TOKEN })(c, next)
    }
    return next()
})

app.get('/download', async (c) => {
    const { BASE_URL } = env(c)
    const files = await fs.readdir(DOWNLOAD_PATH)
    return c.json({
        success: true,
        downloads: files.map((file) => ({
            name: file,
            url: new URL(`/download/${file}`, BASE_URL).toString(),
        })),
    })
})

app.get('/download/*', serveStatic({
    root: path.relative(process.cwd(), DOWNLOAD_PATH), // 绝对路径会找不到文件，所以使用相对路径
    rewriteRequestPath: (filepath) => filepath.replace('/download/', './'),
}))

app.post('/download', async (c) => {
    const { BASE_URL } = env(c)
    const body = await c.req.json<DownloadRequest>()
    logger.debug('下载请求 %O', body)
    const { url, playlist, callback, name, async } = body
    let engine = body.engine || 'auto'
    // const name = slugify(body.name || '', '_') // 获取 url 友好的名称
    if (!engine || engine === 'auto') {
        engine = EngineEnum.YOU_GET
    }
    if (!async) {
        const { success, downloads } = await downloader({ engine, url, name, playlist }, BASE_URL)
        return c.json({ success, downloads, async: false })
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

app.delete('/download/:name', async (c) => {
    const name = c.req.param('name')
    const filePath = path.join(DOWNLOAD_PATH, name)
    if (await fs.pathExists(filePath)) {
        await fs.remove(filePath)
    }
    return c.json({ success: true })
})

export default app
