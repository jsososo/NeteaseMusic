export default {
  isHearMode: (state) => {
    return state.heartMode;
  },
  getPlayingListId: (state) => {
    return state.playingListId;
  },
  getOperation: (state) => {
    return state.operation;
  },
  // 获取网易用户
  getUser: (state) => {
    return state.user;
  },
  // 获取用户歌单
  getUserList: (state) => {
    return state.userList;
  },
  getSearch: (state) => {
    return state.search;
  },
  getAllList: (state) => {
    return state.allList;
  },
  // 推荐列表
  getRecommendList: (state) => {
    return state.recommendList;
  },
  // 播放进度
  getPlayingPercent: (state) => {
    return state.playingPercent;
  },
  // 是否显示评论
  getShowComment: (state) => {
    return state.showComment;
  },
  // 获取电台信息
  getRadioInfo: (state) => {
    return state.radioInfo;
  },
  // 获取下载列表信息
  getDownList: (state) => {
    return state.downloadList;
  },
  // 获取全部的歌曲
  getAllSongs(state) {
    return state.allSongs;
  },
  // 获取展示列表
  getShowList(state) {
    return state.showList;
  },
  // 是否正在下载歌曲
  isDownloading(state) {
    return state.downloading;
  },
  // 获取正在播放的歌曲信息
  getPlaying(state) {
    return state.playNow;
  },
  // 是在播放还是暂停
  isPlaying(state) {
    return state.playing;
  },
  // 是否正在加载
  isLoading(state) {
    return state.loading;
  },
  // 获取右侧内容名
  getListContent(state) {
    return state.listContent;
  },
  // 获取是搜索列表哪还是qq音乐
  getSearchKey(state) {
    return state.searchKey;
  },
  isShowCoverImg(state) {
    return state.showCoverImg;
  }
}