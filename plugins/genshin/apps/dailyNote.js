import plugin from '../../../lib/plugins/plugin.js'
import Note from '../model/note.js'
import MysSign from '../model/mysSign.js'
import gsCfg from '../model/gsCfg.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'

gsCfg.cpCfg('mys', 'set')

export class dailyNote extends plugin {
  constructor () {
    super({
      name: '查询',
      dsc: '原神体力、札记查询，米游社签到',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^#?(原神)?(体力|树脂|查询体力)$',
          fnc: 'note'
        },
        {
          reg: '^(#?签到)(force)*$',
          fnc: 'sign'
        },
        {
          reg: '^#?全部用户签到(force)*$',
          permission: 'master',
          fnc: 'signTask'
        },
        {
          reg: '^#?(开启|关闭|取消)自动(米游社)*签到$',
          fnc: 'signClose'
        }
      ]
    })

    this.set = gsCfg.getConfig('mys', 'set')

    /** 定时任务 */
    this.task = {
      cron: this.set.signTime,
      name: '米游社原神签到任务',
      fnc: () => this.signTask()
    }
  }
  

  /** #体力 */
  async note () {
    let data = await Note.get(this.e)
    if (!data) return

    /** 生成图片 */
    let img = await puppeteer.screenshot('dailyNote', data)
    if (img) await this.reply(img)
  }

  /** #签到 */
  async sign () {
    await MysSign.sign(this.e)
  }

  /** 签到任务 */
  async signTask () {
    let mysSign = new MysSign(this.e)
    await mysSign.signTask(!!this?.e?.msg)
  }

  async signClose () {
    let mysSign = new MysSign(this.e)
    await mysSign.signClose()
  }
}
