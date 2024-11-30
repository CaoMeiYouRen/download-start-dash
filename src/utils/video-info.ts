import { VideoInfo } from '@/interfaces/video-info'

/**
 *
 * 解析 you-get 的 json 输出信息
 * @author CaoMeiYouRen
 * @date 2024-08-28
 * @export
 * @param input
 */
export function parseJsonArray(input: string): VideoInfo[] {
    const jsonObjects = input.trim().split(/\}\s*\{/).map((obj) => {
        if (!obj.startsWith('{')) {
            obj = `{${obj}`
        }
        if (!obj.endsWith('}')) {
            obj += '}'
        }
        return obj
    })

    try {
        const jsonArray = jsonObjects.map((e) => {
            try {
                return JSON.parse(e)
            } catch (error) {
                console.error(error)
                return {}
            }
        })
        const parsedArray: VideoInfo[] = jsonArray
        return parsedArray
    } catch (error) {
        console.error('Error parsing JSON:', error)
        return []
    }
}
