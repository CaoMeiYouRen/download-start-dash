import os from 'os'
import { $, usePowerShell, useBash, which, quote } from 'zx'
import { Engine, EngineEnum } from '@/interfaces/download'
import logger from '@/middlewares/logger'

$.verbose = true
if (os.platform() === 'win32') { // 如果是 Windows 系统，则切换到 PowerShell
    usePowerShell()
    logger.debug('检测到 Windows 系统，切换到 PowerShell')
} else {
    // 检查是否安装 bash
    const bashPath = await which('bash', { nothrow: true })
    if (!bashPath) {
        logger.error('bash 未安装！无法执行命令！')
        process.exit(1)
    }
    useBash()
    if (!$.quote) {
        $.quote = quote
    }
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
