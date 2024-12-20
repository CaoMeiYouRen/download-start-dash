import path from 'path'
import dotenv from 'dotenv'
import { getRuntimeKey } from 'hono/adapter'
const result = dotenv.config({
    path: [
        '.env.local',
        '.env',
    ],
})
const envObj = result.parsed

if (process.env.NODE_ENV === 'development') {
    console.log('envObj', envObj)
}

export const __PROD__ = process.env.NODE_ENV === 'production'
export const __DEV__ = process.env.NODE_ENV === 'development'

export const PORT = parseInt(process.env.PORT) || 3000

// 是否写入日志到文件
export const LOGFILES = process.env.LOGFILES === 'true'

export const LOG_LEVEL = process.env.LOG_LEVEL || (__DEV__ ? 'silly' : 'http')

// 判断当前运行时 是否是 Cloudflare Workers
export const IS_CLOUDFLARE_WORKERS = process.env.RUNTIME_KEY === 'cloudflare-workers' || getRuntimeKey() === 'workerd'

export const AUTH_TOKEN = process.env.AUTH_TOKEN

export const DATA_PATH = path.resolve(process.env.DATA_PATH || './data')

export const DOWNLOAD_PATH = path.resolve(process.env.DOWNLOAD_PATH || `${DATA_PATH}/download`)

export const COOKIES_PATH = path.resolve(process.env.COOKIES_PATH || `${DATA_PATH}/cookies`)

export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`

export const COOKIE_CLOUD_URL = process.env.COOKIE_CLOUD_URL
export const COOKIE_CLOUD_PASSWORD = process.env.COOKIE_CLOUD_PASSWORD

export const PROXY_URL = process.env.PROXY_URL
