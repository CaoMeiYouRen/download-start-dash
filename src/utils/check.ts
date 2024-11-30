import os from 'os'
import { $, usePowerShell, which } from 'zx'
import { Engine, EngineEnum } from '@/interfaces/download'
import logger from '@/middlewares/logger'
if (os.platform() === 'win32') { // 如果是 Windows 系统，则切换到 PowerShell
    usePowerShell()
    $.verbose = true
    logger.debug('检测到 Windows 系统，切换到 PowerShell')
} else {
    logger.debug('检测到非 Windows 系统，使用默认 shell')
}

// 检查下载器是否安装
export const checkEngines = async () => {
    // 检查 ffmpeg 是否安装
    const ffmpegPath = await which('ffmpeg', { nothrow: true })
    if (!ffmpegPath) {
        logger.error('ffmpeg 未安装。ffmpeg 为必要依赖，用以下载流式视频以及合并分块视频！')
    } else {
        logger.info(`ffmpeg 已安装，路径为 ${ffmpegPath}`)
    }
    const engines = Object.values(EngineEnum)
    for (const engine of engines) {
        logger.debug(`检查下载器 ${engine}`)
        const path = await checkEngine(engine)
        if (!path) {
            logger.warn(`下载器 ${engine} 未安装`)
        } else {
            logger.info(`下载器 ${engine} 已安装，路径为 ${path}`)
        }
    }
    return true
}

// 检查下载器是否安装
export const checkEngine = async (engine: Engine) => {
    const command = engine === 'auto' ? 'you-get' : engine
    return which(command, { nothrow: true })
}
