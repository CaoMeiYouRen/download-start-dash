import path from 'path'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { name } from '../package.json'
import { DOWNLOAD_PATH, PORT } from './env'
import app from './app'
import logger from './middlewares/logger'

app.use('/download/*', serveStatic({
    root: path.relative(process.cwd(), DOWNLOAD_PATH), // 绝对路径会找不到文件，所以使用相对路径
    rewriteRequestPath: (filepath) => filepath.replace('/download/', './'),
}))
// nodejs 运行时添加 静态文件服务。vercel 会自动挂载 public 文件夹为静态文件目录，所以无需添加
app.get('/*', serveStatic({ root: './public' }))

serve({
    fetch: app.fetch,
    port: PORT,
})

logger.info(`${name} 启动成功，访问地址：http://localhost:${PORT}`)
