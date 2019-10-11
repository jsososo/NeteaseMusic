import Storage from './Storage';

export const messageHelp = (id) => {
  const message = {
    1: {
      title: '新功能',
      message: '搜索功能全面支持 QQ 音乐啦',
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
    }
  };

  if (!Storage.get(`notify-${id}`)) {
    window.VUE_APP.$notify(message[id]);
    Storage.set(`notify-${id}`, '1');
  }
};