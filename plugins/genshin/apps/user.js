import plugin from '../../../lib/plugins/plugin.js'
import fs from 'node:fs'
import gsCfg from '../model/gsCfg.js'
import User from '../model/user.js'

export class user extends plugin {
  constructor(e) {
    super({
      name: '用户绑定',
      dsc: '米游社ck绑定，游戏uid绑定',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^#?(ck|cookie)帮助',
          fnc: 'ckHelp'
        },
        {
          reg: '^#?(ck|cookie|js)代码$',
          fnc: 'ckCode'
        },
        {
          reg: '^#?绑定(cookie|ck)$',
          fnc: 'bingCk'
        },
        {
          reg: '(.*)_MHYUUID(.*)',
          event: 'message.private',
          fnc: 'noLogin'
        },
        {
          reg: '^#?我的(ck|cookie)$',
          event: 'message',
          fnc: 'myCk'
        },
        {
          reg: '^#?删除(ck|cookie)$',
          fnc: 'delCk'
        },
        {
          reg: '^#?绑定(uid|UID)?(\\s)*[1-9][0-9]{8}$',
          fnc: 'bingUid'
        },
        {
          reg: '^#?(我的)?(uid|UID)[0-9]{0,2}$',
          fnc: 'showUid'
        },
        {
          reg: '^#?\\s*(检查|我的)*ck(状态)*$',
          fnc: 'checkCkStatus'
        }
      ]
    })
    this.User = new User(e)
  }

  async init() {
    let file = './data/MysCookie'
    if (!fs.existsSync(file)) {
      fs.mkdirSync(file)
    }
    /** 加载旧的绑定ck json */
    this.loadOldData()
  }

  /** 接受到消息都会执行一次 */
  accept() {
    if (!this.e.msg) return
    // 由于手机端米游社网页可能获取不到ltuid 可以尝试在通行证页面获取login_uid
    if (/(ltoken|ltoken_v2)/.test(this.e.msg) && /(ltuid|login_uid|ltmid_v2)/.test(this.e.msg)) {
      if (this.e.isGroup) {
        this.reply('请私聊发送cookie', false, { at: true })
        return true
      }
      this.e.ck = this.e.msg
      this.e.msg = '#绑定cookie'
      return true
    }

    if (this.e.msg == '#绑定uid') {
      this.setContext('saveUid')
      this.reply('请发送绑定的uid', false, { at: true })
      return true
    }
  }

  /** 绑定uid */
  saveUid() {
    if (!this.e.msg) return
    let uid = this.e.msg.match(/[1|2|5-9][0-9]{8}/g)
    if (!uid) {
      this.reply('uid输入错误', false, { at: true })
      return
    }
    this.e.msg = '#绑定' + this.e.msg
    this.bingUid()
    this.finish('saveUid')
  }

  /** 未登录ck */
  async noLogin() {
    this.reply('绑定cookie失败\n可以发送【#ck帮助】查看绑定教程')
  }

  /** #ck代码 */
  async ckCode() {
    await this.reply('javascript:(()=>{prompt(\'\',document.cookie)})();')
  }

  /** ck帮助 */
  async ckHelp() {
    let set = gsCfg.getConfig('mys', 'set')
    await this.reply(`请先绑定cookie，绑定方式如下：\n1：发送ck代码，获取教程${set.cookieDoc}获取后私聊发送\n2：使用命令【#扫码登陆】自动获取绑定，并可以使用命令【#刷新ck】失效刷新`)
  }

  /** 绑定ck */
  async bingCk() {
    let set = gsCfg.getConfig('mys', 'set')

    if (!this.e.ck) {
      await this.reply(`请先绑定cookie，绑定方式如下：\n1：ck代码获取教程${set.cookieDoc}获取后私聊发送\n2：使用命令【#扫码登陆】自动获取绑定，并可以使用命令【#刷新ck】失效刷新`)
      return
    }

    await this.User.bing()
  }

  /** 删除ck */
  async delCk() {
    let msg = await this.User.delCk()
    await this.reply(msg)
  }

  /** 绑定uid */
  async bingUid() {
    await this.User.bingUid()
  }

  /** #uid */
  async showUid() {
    let index = this.e.msg.match(/[0-9]{1,2}/g)
    if (index && index[0]) {
      await this.User.toggleUid(index[0])
    } else {
      await this.User.showUid()
    }
  }

  /** 我的ck */
  async myCk() {
    if (this.e.isGroup) {
      await this.reply('请私聊查看')
      return
    }
    await this.User.myCk()
  }

  /** 加载旧的绑定ck json */
  loadOldData() {
    this.User.loadOldData()
  }

  /** 检查用户CK状态 **/
  async checkCkStatus() {
    await this.User.checkCkStatus()
  }
}
