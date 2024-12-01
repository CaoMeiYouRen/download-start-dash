import { md5 } from './crypto'

export function addAuthCode(downloads: string[], authToken: string) {
    return downloads.map((download) => {
        const url = new URL(download)
        const authCode = md5(`${url.pathname}${authToken}`)
        url.searchParams.set('authCode', authCode)
        return url.toString()
    })
}
