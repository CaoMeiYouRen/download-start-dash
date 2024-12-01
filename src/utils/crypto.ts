import crypto from 'crypto'

/**
 * 生成 MD5 哈希值
 *
 * @author CaoMeiYouRen
 * @date 2024-10-25
 * @export
 * @param str
 */
export function md5(str: string) {
    return crypto.createHash('md5').update(str).digest('hex')
}
