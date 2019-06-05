export default {
  allSongs: {}, // 全部的歌曲信息
  allList: {}, // 全部的歌单
  user: {}, // 用户信息
  userList: {}, // 用户歌单信息
  search: { // 搜索的参数和结果
    type: 1,
    total: 0,
    pageNo: 1,
    keywords: '',
  },
  playingList: { // 播放列表，里面有原列表、随机列表、历史列表、历史顺序
    raw: [], // 原始的歌单
    trueList: [], // 筛选后有url的歌单
    random: [],
    history: [],
    index: 0,
  },
  playNow: { // 正在波放的歌曲信息
    al: {},
    ar: '',
  },
  playingPercent: 0,
  showCoverImg: true,

  playing: false,
  playerInfo: { // 播放器信息
    duration: 0,
    current: 0,
    paused: true,
  },
  loading: false,
};