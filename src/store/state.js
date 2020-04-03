export default {
  mode: '', // 一个全局的 ui 模式
  allSongs: {}, // 全部的歌曲信息，其他地方除了 playNow 不再存储信息，一律通过 id 到 allSongs 中获取
  allList: {}, // 全部的歌单信息，和 allSongs 类似
  user: {}, // 用户信息
  userList: {}, // 用户歌单信息
  qUserList: {
    list: [],
    obj: {},
  }, // qq音乐的用户歌单信息
  recommendList: {}, // 推荐歌单信息
  search: { // 搜索的参数和结果
    type: 0,
    total: 0,
    pageNo: 1,
    keywords: '',
    platform: '163',
  },
  playingList: { // 播放列表，里面有原列表、随机列表、历史列表、历史顺序，这几个数组中一律存放歌曲id
    raw: [], // 原始的歌单
    trueList: [], // 筛选后有url的歌单
    random: [], // 随机列表
    history: [], // 播放历史
    index: 0, // 当前播放对应播放历史的位置
  },
  playNow: { // 正在播放的歌曲信息
    al: {},
    ar: [],
  },
  playingPercent: 0, // 当前播放进度
  showCoverImg: true, // 是否显示专辑封面图片，有些页面是不显示的
  playingListId: '', // 正在播放的歌单id
  heartMode: false, // 是否是心动模式
  operation: {},
  playing: false,
  playerInfo: { // 播放器信息
    duration: 0,
    current: 0,
    paused: true,
  },
  commentInfo: { // 自己写评论时的评论信息
    type: 0,
    id: 0,
    val: '',
    title: '',
    open: false,
  },
  loading: false,
  reading: false,
  downloadInfo: { // 下载信息
    count: 0,
    list: [],
  },
  isPersonFM: false, // 是否为私人fm,
  favSongMap: { // 喜欢的歌曲 id map
    163: {},
    qq: {},
  },
};