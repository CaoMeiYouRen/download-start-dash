
export const EngineEnum = {
    AUTO: 'auto', // 自动选择下载器，默认使用 you-get
    YOU_GET: 'you-get', // 用于下载视频
    ARIA2: 'aria2c', // 用于下载直链视频
    YUTTO: 'yutto', // 用于 bilibili
    YOUTUBE_DL: 'youtube-dl', // 用于 youtube
    YT_DLP: 'yt-dlp', // 用于 youtube
} as const

export type Engine = (typeof EngineEnum)[keyof typeof EngineEnum]

export interface DownloadRequest {
    // 是否异步下载
    async?: boolean
    // 下载器
    engine?: Engine
    // 视频地址
    url: string
    // 视频名称
    name?: string
    // 是否下载整个播放列表
    playlist?: boolean
    // 下载完成后的回调地址
    callback?: string
}
