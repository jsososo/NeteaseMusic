export default {
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
  getPlayingPercent: (state) => {
    return state.playingPercent;
  },
  // 获取搜索参数
  getSearchQuery: (state) => {
    return state.searchQuery;
  },
  // 是否显示评论
  getShowComment: (state) => {
    return state.showComment;
  },
  // 获取电台信息
  getRadioInfo: (state) => {
    return state.radioInfo;
  },
  // 是否显示下载配置弹窗
  getDownSettingDialog: (state) => {
    return state.downSettingDialog;
  },
  // 获取下载列表信息
  getDownList: (state) => {
    return state.downloadList;
  },
  // 获取选中的歌曲
  getSelectedSongs: (state) => {
    return state.selectedSongs;
  },
  // 获取我喜欢的列表
  getFavList: (state) => {
    return state.favList;
  },
  // 添加到歌单的一些信息
  add2DirInfo: (state) => {
    return state.add2Dir;
  },
  // 获取系统的tag列表
  getTagList: (state) => {
    return state.sysTags;
  },
  // 获取tag的状态信息
  getTagInfo(state) {
    return state.tagInfo;
  },
  // 获取全部的歌曲
  getAllSongs(state) {
    return state.allSongs;
  },
  // 获取展示列表
  getShowList(state) {
    return state.showList;
  },
  // 获取播放器状态信息
  getPlayerInfo(state) {
    return state.playerInfo;
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