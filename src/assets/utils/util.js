import Storage from './Storage';

export const messageHelp = (id) => {
  const message = {
    4: {
      title: '新功能',
      message: '搜索功能全面支持 QQ 音乐啦，vip 的拦截设置绕圈子暂时解决啦，更多内容前去关于了解',
      type: 'info',
      duration: 20000,
    },
    2: {
      title: 'tips',
      message: '如果网易云寻不到想要的歌曲，就点下「企鹅」试试吧',
      type: 'info',
      duration: 20000,
    },
    3: {
      title: '😫',
      message: '由于qq音乐对 vip 音乐增加了拦截限制，所以目前无法再获取 vip 音乐的播放链接，请谅解',
      type: 'info',
      duration: 20000,
    },
    5: {
      title: '新功能！！',
      message: '🐧 音乐歌单全方面支持啦！去歌单页面，切到🐧tab，输入企鹅号就可以啦（需要企鹅音乐主页设为公开）',
      type: 'info',
      duration: 20000,
    },
    6: {
      title: '看见音乐！',
      message: '新增了音频图的显示，如果影响到了性能和流量请点左上角头像，关闭显示！',
      type: 'info',
      duration: 20000,
    }
  };

  if (!Storage.get(`notify-${id}`)) {
    window.VUE_APP.$notify(message[id]);
    Storage.set(`notify-${id}`, '1');
  }
};