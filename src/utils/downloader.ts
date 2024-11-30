import { $ } from 'zx'
import slugify from 'slugify'
import { to } from 'await-to-js'
import { checkEngine } from './check'
import { legitimize } from './filename'
import { parseJsonArray } from './video-info'
import { DownloadRequest, EngineEnum } from '@/interfaces/download'
import logger from '@/middlewares/logger'
import { DOWNLOAD_PATH } from '@/env'

const tryYouGet = async (url: string, withPlaylist: boolean) => {
    const flags: string[] = [url, '--json']
    if (withPlaylist) {
        flags.push('--playlist')
    }
    const [error, output] = await to($`you-get ${flags}`)
    if (error) {
        logger.error(error)
        return []
    }
    return parseJsonArray(output.stdout)
}

async function youGetInfos(url: string) {
    let result = await tryYouGet(url, true)
    if (result.length === 0) {
        // 部分情况下添加 --playlist 参数会获取失败（例如：在 B 站视频为特殊页面时，而不是普通视频时）
        result = await tryYouGet(url, false)
    }
    return result
}

export const downloader = async (request: DownloadRequest, baseUrl: string) => {
    const { engine, url, playlist } = request
    const name = legitimize(request.name || '')
    let downloads: string[] = [] // 如果是playlist，则存在多个链接
    const enginePath = await checkEngine(engine)
    if (!enginePath) {
        throw new Error(`下载器 ${engine} 未安装`)
    }
    downloads.push(new URL(`/download/${name}`, baseUrl).toString())
    try {
        switch (engine) {
            case EngineEnum.YOU_GET: {
                downloads = []
                const infos = await youGetInfos(url)
                if (infos.length === 1) {
                    const info = infos[0]
                    const flags: string[] = []
                    flags.push(info.url)
                    flags.push('-o', DOWNLOAD_PATH)
                    const videoName = name || legitimize(info.title)// 只有单个视频时，允许自定义视频名称
                    flags.push('-O', videoName)
                    await $`you-get ${flags}`.verbose()
                    const ext = Object.values(info.streams)?.[0]?.container
                    downloads.push(new URL(`/download/${videoName}.${ext}`, baseUrl).toString())
                    return {
                        success: true,
                        downloads,
                    }
                }
                for (const info of infos) {
                    const flags: string[] = []
                    flags.push(info.url)
                    flags.push('-o', DOWNLOAD_PATH)
                    const videoName = legitimize(info.title)
                    flags.push('-O', videoName)
                    await $`you-get ${flags}`.verbose()
                    const ext = Object.values(info.streams)?.[0]?.container
                    downloads.push(new URL(`/download/${videoName}.${ext}`, baseUrl).toString())
                }
                return {
                    success: true,
                    downloads,
                }
            }
            case EngineEnum.ARIA2: {
                const flags: string[] = []
                flags.push('-i', url)
                flags.push('-d', DOWNLOAD_PATH)
                if (name) {
                    flags.push('-o', name)
                }
                await $`aria2c ${flags}`.verbose()
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
                if (name) {
                    flags.push('-o', name)
                }
                if (playlist) {
                    flags.push('--batch')
                }
                await $`yutto ${flags}`.verbose()
                return {
                    success: true,
                    downloads,
                }
            }
            case EngineEnum.YOUTUBE_DL:
            case EngineEnum.YT_DLP: { // yt-dlp 是 youtube-dl 的 fork
                const flags: string[] = []
                flags.push(url)
                if (name) {
                    flags.push('-o', `${name}.%(ext)s`)
                } else {
                    flags.push('-o', '%(title)s_[%(id)s].%(ext)s')
                }
                if (playlist) {
                    flags.push('--yes-playlist')
                }
                flags.push('--paths', DOWNLOAD_PATH)
                flags.push('--cache-dir', DOWNLOAD_PATH)
                if (engine === EngineEnum.YOUTUBE_DL) {
                    await $`yt-dlp ${flags}`.verbose()
                } else {
                    await $`youtube-dl ${flags}`.verbose()
                }
                return {
                    success: true,
                    downloads,
                }
            }
        }
    } catch (error) {
        logger.error(error)
        return {
            success: false,
            downloads,
        }
    }
    throw new Error(`未知的下载器 ${engine}`)
}
