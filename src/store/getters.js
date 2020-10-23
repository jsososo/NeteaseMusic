export default {
  getMode: (state) => {
    return state.mode;
  },
  getQUserList: (state) => {
    return state.qUserList;
  },
  isHearMode: (state) => {
    return state.heartMode;
  },
  getPlayingList: (state) => {
    return state.playingList;
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
  // 获取电台信息
  getRadioInfo: (state) => {
    return state.radioInfo;
  },
  // 获取全部的歌曲
  getAllSongs(state) {
    return state.allSongs;
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
  isShowCoverImg(state) {
    return state.showCoverImg;
  },
  getCommentInfo(state) {
    return state.commentInfo;
  },
  getDownloadInfo(state) {
    return state.downloadInfo;
  },
  isPersonFM(state) {
    return state.isPersonFM;
  },
  getFavSongMap(state) {
    return state.favSongMap;
  },
  getTopInfo(state) {
    return state.topInfo;
  }
}