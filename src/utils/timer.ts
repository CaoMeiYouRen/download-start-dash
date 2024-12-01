import { CronJob } from 'cron'
import { timeFormat } from './date'
import logger from '@/middlewares/logger'

export const timer = (cronTime: string | Date, callback: () => void | Promise<void>) => {
    const job = new CronJob(cronTime,
        async () => {
            logger.info(`开始执行定时任务${cronTime}`)
            await callback()
            logger.info(`定时任务 ${cronTime} 执行完毕`)
            logger.info(`定时任务 ${cronTime} 下次执行时间：${timeFormat(job.nextDate().toJSDate())}`)
        },
        null,
        false,
        'Asia/Shanghai',
    )
    job.start()
    logger.info(`定时任务 ${cronTime} 已启动`)
    logger.info(`定时任务 ${cronTime} 下次执行时间：${timeFormat(job.nextDate().toJSDate())}`)
}
