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
    },
    7: {
      title: '咪咕音乐！',
      message: '新增咪咕音乐的支持，搜索页面的最右侧！同样支持无损～',
      type: 'info',
      duration: 20000,
    },
    8: {
      message: '反馈可以戳右下面👇',
      type: 'info',
      duration: 20000,
    },
    9: {
      message: ''
    }
  };
  const newMessage = [
    {
      content: '',
      time: '',
    },
    {
      content: '反馈可以戳右下面👇',
      time: '20-01-09',
    },
    {
      content: '可以前往设置页，自行加入企鹅音乐Cookie啦，未来会支持更多操作',
      time: '20-01-31',
    },
    {
      content: '数据层面和接口重大重构！如果有什么bug及时反馈！',
      time: '20-05-17',
    },
    {
      content: '音频图大优化！windows 也不卡了！',
      time: '20-06-16',
    },
    {
      content: '如果无法播放可以尝试去设置页关闭先进模式',
      time: '20-07-07',
    },
    {
      content: '支持歌词下载 & 下载歌名格式选择，前往设置页查看！',
      time: '20-08-02',
    },
    {
      content: '会员 & 无版权歌曲替换回来啦！',
      time: '20-08-15',
    },
    {
      content: 'chrome 播放控件支持（可以用系统快捷键 & 耳机切歌啦！）',
      time: '20-08-30',
    },
    {
      content: '获取 Cookie 的 chrome 插件更新啦，可以去设置页看看',
      time: '20-09-02',
    },
    {
      content: '支持加入正在播放 & 倍速 & 极简模式支持隐藏专辑封面',
      time: '20-09-15',
    },
    {
      content: 'MV 回归 & 歌单详情长列表性能优化 & 音量调节改为单次5%',
      time: '20-09-18',
    },
    {
      content: '支持左侧显示歌词（前往设置） & cookie 支持微信',
      time: '20-11-06'
    },
    {
      content: '受企鹅修改跨域限制影响，取消先进模式 & 音频图',
      time: '20-11-30'
    },
    {
      content: '优化先进模式（网易云恢复音频图 & 新增清空正在播放列表',
      time: '20-12-06'
    },
    {
      content: '估计服务器IP被网易云封禁（换过一次了，很快又被封了），登录/收藏等接口失效，兼容方案为，歌单页支持用户输入id获取用户歌单',
      time: '20-12-28'
    }
  ];
  if (id === 'newInfo') {
    const newInfoIndex = Number(Storage.get('notify-new-index') || 0);
    if (newInfoIndex < (newMessage.length - 1)) {
      Storage.set('notify-new-index', newMessage.length - 1);
      window.VUE_APP.$notify({
        title: '更新记录！',
        message: newMessage.slice(newInfoIndex + 1).map((v) => `${v.content} (${v.time})`).slice(-3).join('<br/>'),
        duration: (newMessage.length - newInfoIndex) * 20000,
        dangerouslyUseHTMLString: true,
      })
    }
    return;
  }

  if (!Storage.get(`notify-${id}`)) {
    window.VUE_APP.$notify(message[id]);
    Storage.set(`notify-${id}`, '1');
  }
};

export const handlePlayingList = {
  playMusic: ({id, arr, listId, isDetail = false}) => {
    const { allSongs, allList, playingList } = window.VUE_APP.$store.state;
    const { dispatch } = window.VUE_APP.$store;
    const song = allSongs[id];
    if (!song.url) {
      return;
    }
    let list = listId ? allList[listId] : arr;

    if (listId && listId.indexOf('playing') > -1) {
      list = playingList.trueList;
    }
    dispatch('updatePlayNow', song);
    dispatch('updatePlayingStatus', true);
    let updateData;
    if (isDetail) {
      // 歌单详情页
      if (Number(Storage.get('PLAY_MUSIC_FROM_PLAYLIST'))) {
        updateData = { list, listId };
      } else {
        updateData = { list: [id], more: true };
      }
    } else {
      // 其他的列表
      if (Number(Storage.get('PLAY_MUSIC_FROM_LIST'))) {
        updateData = { list };
      } else {
        updateData = { list: [id], more: true };
      }
    }
    setTimeout(() => {
      window.pDom.play();
    });

    dispatch('updatePlayingList', updateData);
  },

  playList: (arr) => {
    const { $store, $message } = VUE_APP;
    const { state, dispatch } = $store;
    const { allSongs } = $store.state;
    const list = arr.filter((s) => allSongs[s].url);
    if (!list.length) {
      return $message.warning('无可播放歌曲');
    }
    dispatch('updatePlayNow', allSongs[list[0]]);
    dispatch('updatePlayingList', { list });
    dispatch('updatePlayingStatus', true);
  },

  addPlaying: (id) => {
    const { $message, $store } = window.VUE_APP;
    window.event.stopPropagation();
    $store.dispatch('updatePlayingList', { list: [id], more: true });
    $message.success('已加入播放列表！');
  },

  removePlaying: (id) => {
    window.event.stopPropagation();
    const { $store, $message } = window.VUE_APP
    const { state, dispatch } = $store;
    const { playingList, playNow } = state;
    if (id === playNow.aId) {
      dispatch('playNext');
    }
    dispatch('updatePlayingList', { list: playingList.raw.filter((s) => s !== id)});
    $message.success('移出播放列表！');
  }
}