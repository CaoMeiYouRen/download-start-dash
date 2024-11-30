import os from 'os'

// 检测操作系统
export function detectOS() {
    const platform = os.platform()
    if (platform === 'win32') {
        return 'windows'
    } if (platform === 'darwin') {
        return 'mac'
    } if (platform === 'linux') {
        return 'linux'
    }
    return 'unknown'

}

// 将文件名转换为合法的文件名
export function legitimize(text: string, platform = detectOS()) {
    // POSIX systems
    text = text.replace(/\0/g, '')
        .replace(/\//g, '-')
        .replace(/\|/g, '-')

    if (platform === 'windows') {
        // Windows (non-POSIX namespace)
        text = text.replace(/:/g, '-')
            .replace(/\*/g, '-')
            .replace(/\?/g, '-')
            .replace(/\\/g, '-')
            .replace(/"/g, '\'')
            .replace(/\+/g, '-')
            .replace(/</g, '-')
            .replace(/>/g, '-')
            .replace(/\[/g, '(')
            .replace(/\]/g, ')')
            .replace(/\t/g, ' ')
    } else {
        // *nix
        if (platform === 'mac') {
            // Mac OS HFS+
            text = text.replace(/:/g, '-')
        }

        // Remove leading .
        if (text.startsWith('.')) {
            text = text.slice(1)
        }
    }

    // Trim to 80 characters long
    text = text.substring(0, 80)

    return text
}
