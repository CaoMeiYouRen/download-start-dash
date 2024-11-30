import { $ } from 'zx'
import { checkEngine } from './check'
import { DownloadRequest, EngineEnum } from '@/interfaces/download'
import logger from '@/middlewares/logger'
import { DOWNLOAD_PATH } from '@/env'

export const downloader = async (request: DownloadRequest) => {
    const { engine, url, name, playlist } = request
    const enginePath = await checkEngine(engine)
    if (!enginePath) {
        throw new Error(`下载器 ${engine} 未安装`)
    }
    try {
        switch (engine) {
            case EngineEnum.YOU_GET: {
                const flags: string[] = []
                flags.push(url)
                flags.push('-o', DOWNLOAD_PATH)
                if (name) {
                    flags.push('-O', name)
                }
                if (playlist) {
                    flags.push('--playlist')
                }
                await $`you-get ${flags}`.verbose()
                return true
            }
            case EngineEnum.ARIA2: {
                const flags: string[] = []
                flags.push('-i', url)
                flags.push('-d', DOWNLOAD_PATH)
                if (name) {
                    flags.push('-o', name)
                }
                await $`aria2c ${flags}`.verbose()
                return true
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
                return true
            }
            case EngineEnum.YOUTUBE_DL: {
                const flags: string[] = []
                flags.push(url)
                if (name) {
                    flags.push('-o', `${name}_[%(id)s].%(ext)s`)
                } else {
                    flags.push('-o', '%(title)s_[%(id)s].%(ext)s')
                }
                if (playlist) {
                    flags.push('--yes-playlist')
                }
                flags.push('--paths', DOWNLOAD_PATH)
                flags.push('--cache-dir', DOWNLOAD_PATH)
                await $`youtube-dl ${flags}`.verbose()
                return true
            }
            case EngineEnum.YT_DLP: {
                const flags: string[] = []
                flags.push(url)
                if (name) {
                    flags.push('-o', `${name}_[%(id)s].%(ext)s`)
                } else {
                    flags.push('-o', '%(title)s_[%(id)s].%(ext)s')
                }
                if (playlist) {
                    flags.push('--yes-playlist')
                }
                flags.push('--paths', DOWNLOAD_PATH)
                flags.push('--cache-dir', DOWNLOAD_PATH)
                await $`yt-dlp ${flags}`.verbose()
                return true
            }
        }
    } catch (error) {
        logger.error(error)
        return false
    }
    throw new Error(`未知的下载器 ${engine}`)
}
