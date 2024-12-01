import path from 'path'
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { env } from 'hono/adapter'
import fs from 'fs-extra'
import { serveStatic } from '@hono/node-server/serve-static'
import { HTTPException } from 'hono/http-exception'
import { Bindings } from '../types'
import { DownloadRequest, EngineEnum } from '@/interfaces/download'
import { downloader } from '@/utils/downloader'
import logger from '@/middlewares/logger'
import { DOWNLOAD_PATH } from '@/env'
import { md5 } from '@/utils/crypto'
import { addAuthCode } from '@/utils/auth'

const app = new Hono<{ Bindings: Bindings }>()

app.on(['POST', 'DELETE', 'PUT'], ['/download', '/download/*'], (c, next) => {
    const { AUTH_TOKEN } = env(c)
    if (AUTH_TOKEN) {
        return bearerAuth({ token: AUTH_TOKEN })(c, next)
    }
    return next()
})

app.on(['GET'], ['/download', '/download/*'], (c, next) => {
    const { AUTH_TOKEN = '' } = env(c)
    if (AUTH_TOKEN) {
        // 在 GET 请求中，支持通过 authToken/authCode/bearer 认证
        const url = new URL(c.req.url)
        const reqPath = url.pathname
        const query = c.req.query()
        const { authToken, authCode } = query
        if (authToken && authToken !== AUTH_TOKEN) { // 支持通过 authToken 验证
            throw new HTTPException(403, { message: 'Auth token is invalid' })
        }
        const code = md5(`${reqPath}${AUTH_TOKEN}`)
        if (authCode && authCode !== code) { // 支持通过 authCode 验证
            throw new HTTPException(403, { message: 'Auth code is invalid' })
        }
        const bearer = c.req.header('Authorization')
        if (bearer && bearer.split(' ')[1] !== AUTH_TOKEN) { // 支持通过 bearer 验证
            throw new HTTPException(403, { message: 'Bearer token is invalid' })
        }
        return next()
    }
    return next()
})

app.get('/download', async (c) => {
    const { BASE_URL, AUTH_TOKEN = '' } = env(c)
    const files = await fs.readdir(DOWNLOAD_PATH)
    return c.json({
        success: true,
        downloads: files.map((file) => {
            const url = new URL(`/download/${file}`, BASE_URL)
            const authCode = md5(`${url.pathname}${AUTH_TOKEN}`)
            url.searchParams.set('authCode', authCode)
            return {
                name: file,
                url: url.toString(),
            }
        }),
    })
})

app.get('/download/*', serveStatic({
    root: path.relative(process.cwd(), DOWNLOAD_PATH), // 绝对路径会找不到文件，所以使用相对路径
    rewriteRequestPath: (filepath) => filepath.replace('/download/', './'),
}))

app.post('/download', async (c) => {
    const { BASE_URL, AUTH_TOKEN = '' } = env(c)
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
        const authDownloads = addAuthCode(downloads, AUTH_TOKEN)
        return c.json({ success, downloads: authDownloads, async: false })
    }
    downloader({ engine, url, name, playlist }, BASE_URL).then(({ success, downloads }) => {
        if (callback) {
            const authDownloads = addAuthCode(downloads, AUTH_TOKEN)
            fetch(callback, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ success, downloads: authDownloads, async: true }),
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
