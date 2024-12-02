import path from 'path'
import { $ } from 'zx'
import slugify from 'slugify'
import { to } from 'await-to-js'
import { checkEngine } from './check'
import { legitimize } from './filename'
import { parseJsonArray } from './video-info'
import { getCookiePath } from './cookie'
import { DownloadRequest, EngineEnum } from '@/interfaces/download'
import logger from '@/middlewares/logger'
import { DOWNLOAD_PATH, PROXY_URL } from '@/env'

const tryYouGet = async (url: string, withPlaylist: boolean, cookiePath?: string) => {
    const flags: string[] = [url, '--json']
    if (withPlaylist) {
        flags.push('--playlist')
    }
    if (cookiePath) {
        flags.push('-c', cookiePath)
    }
    const [error, output] = await to($`you-get ${flags}`)
    if (error) {
        logger.error(error.stack)
        return []
    }
    return parseJsonArray(output.stdout)
}

async function youGetInfos(url: string, cookiePath?: string) {
    let result = await tryYouGet(url, true, cookiePath)
    if (result.length === 0) {
        // 部分情况下添加 --playlist 参数会获取失败（例如：在 B 站视频为特殊页面时，而不是普通视频时）
        result = await tryYouGet(url, false, cookiePath)
    }
    return result
}

async function getYoutubeTitle(url: string, cookiePath?: string) {
    const flags: string[] = [url, '--get-title']
    if (PROXY_URL) {
        flags.push('--proxy', PROXY_URL)
    }
    if (cookiePath) {
        flags.push('--cookies', cookiePath)
    }
    const [error, output] = await to($`yt-dlp ${flags}`)
    if (error) {
        logger.error(error.stack)
        return ''
    }
    return output.stdout.trim()
}

export const downloader = async (request: DownloadRequest, baseUrl: string) => {
    const { engine, url, playlist } = request
    const name = legitimize(request.name || '')
    const downloads: string[] = [] // 如果是playlist，则存在多个链接
    const enginePath = await checkEngine(engine)
    if (!enginePath) {
        throw new Error(`下载器 ${engine} 未安装`)
    }
    const host = new URL(url).host
    const cookiePath = await getCookiePath(host)
    try {
        switch (engine) {
            case EngineEnum.YOU_GET: {
                const infos = await youGetInfos(url, cookiePath)
                for (const info of infos) {
                    const flags: string[] = []
                    flags.push(info.url)
                    flags.push('-o', DOWNLOAD_PATH)
                    let videoName = legitimize(info.title)
                    if (infos.length === 1) { // 只有单个视频时，允许自定义视频名称
                        videoName = legitimize(name || videoName)
                    }
                    flags.push('-O', videoName)
                    if (cookiePath) {
                        flags.push('-c', cookiePath)
                    }
                    if (PROXY_URL) {
                        if (PROXY_URL.startsWith('http')) {
                            flags.push('--http-proxy', PROXY_URL)
                        } else if (PROXY_URL.startsWith('socks')) {
                            flags.push('--socks-proxy', PROXY_URL)
                        }
                    }
                    const cmd = `you-get ${flags.join(' ')}`
                    logger.info(cmd)
                    await $`you-get ${flags}`
                    const ext = Object.values(info.streams)?.[0]?.container || 'mp4'
                    downloads.push(new URL(`/download/${videoName}.${ext}`, baseUrl).toString())
                }
                return {
                    success: true,
                    downloads,
                }
            }
            case EngineEnum.ARIA2: {
                const flags: string[] = []
                flags.push(url)
                flags.push('--referer', url)
                flags.push('-d', DOWNLOAD_PATH)
                const videoName = slugify(name || url.split('/').pop() || '', '_')
                if (videoName) {
                    flags.push('-o', videoName)
                }
                if (PROXY_URL) {
                    flags.push('--all-proxy', PROXY_URL)
                }
                if (cookiePath) {
                    flags.push('--load-cookies', cookiePath)
                }
                const cmd = `aria2c ${flags.join(' ')}`
                logger.info(cmd)
                await $`aria2c ${flags}`
                downloads.push(new URL(`/download/${videoName}`, baseUrl).toString())
                return {
                    success: true,
                    downloads,
                }
            }
            case EngineEnum.YUTTO: {
                const flags: string[] = []
                flags.push(url)
                flags.push('-d', DOWNLOAD_PATH)
                flags.push('--tmp-dir', DOWNLOAD_PATH)
                const videoName = slugify(name || url.split('/').pop() || '', '_')
                if (videoName) {
                    flags.push('-o', videoName)
                }
                if (playlist) {
                    flags.push('--batch')
                }
                if (PROXY_URL) {
                    flags.push('--proxy', PROXY_URL)
                }
                // TODO: 添加 cookie 支持
                // yutto 要直接传 sessdata，不是 cookie 文件，故暂时搁置
                const cmd = `yutto ${flags.join(' ')}`
                logger.info(cmd)
                await $`yutto ${flags}`
                downloads.push(new URL(`/download/${videoName}`, baseUrl).toString())
                return {
                    success: true,
                    downloads,
                }
            }
            case EngineEnum.YOUTUBE_DL:
            case EngineEnum.YT_DLP: { // yt-dlp 是 youtube-dl 的 fork
                const flags: string[] = []
                flags.push(url)
                flags.push('--cache-dir', DOWNLOAD_PATH)
                if (playlist) {
                    flags.push('--yes-playlist')
                }
                if (PROXY_URL) {
                    flags.push('--proxy', PROXY_URL)
                }
                if (cookiePath) {
                    flags.push('--cookies', cookiePath)
                }
                const title = await getYoutubeTitle(url, cookiePath)
                const videoName = slugify(name || title, '_')
                if (engine === EngineEnum.YT_DLP) {
                    if (videoName) {
                        flags.push('-o', `${videoName}.%(ext)s`)
                    }
                    flags.push('--paths', DOWNLOAD_PATH)
                    const cmd = `yt-dlp ${flags.join(' ')}`
                    logger.info(cmd)
                    await $`yt-dlp ${flags}`
                    // 获取文件名称
                    flags.push('--get-filename')
                    const filepath = (await $`yt-dlp ${flags}`).stdout.trim()
                    const filename = path.basename(filepath)
                    downloads.push(new URL(`/download/${filename}`, baseUrl).toString())
                } else {
                    if (videoName) {
                        flags.push('-o', path.join(DOWNLOAD_PATH, `${videoName}.%(ext)s`))
                    }
                    const cmd = `youtube-dl ${flags.join(' ')}`
                    logger.info(cmd)
                    await $`youtube-dl ${flags}`
                    // 获取文件名称
                    flags.push('--get-filename')
                    const filepath = (await $`youtube-dl ${flags}`).stdout.trim()
                    const filename = path.basename(filepath)
                    downloads.push(new URL(`/download/${filename}`, baseUrl).toString())
                }
                return {
                    success: true,
                    downloads,
                }
            }
        }
    } catch (error) {
        logger.error(error.stack)
        return {
            success: false,
            downloads,
        }
    }
    throw new Error(`未知的下载器 ${engine}`)
}
