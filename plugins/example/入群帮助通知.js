
import plugin from '../../lib/plugins/plugin.js'
export class newcomer extends plugin {
  constructor() {
    super({
      name: '入群帮助通知',
      dsc: '入群帮助通知',
      event: 'notice.group.increase',
      priority: 100
    })
  }

  async accept() {

    let msg = '欢迎使用Yunzai\n可发送【#帮助】【#喵喵帮助】【*帮助】【#图鉴帮助】【#群管帮助】【#土块帮助】查看各功能使用说明\n反馈失效命令请加qq1556841联系\n绑定ck直接发送【#扫码登陆】，失效后可用命令【#刷新ck】自动刷新'
    if (this.e.user_id == Bot.uin) {
      await Bot.pickGroup(this.e.group_id).sendMsg(msg)
    }
  }
}

