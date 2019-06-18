import * as types from './mutationsTypes';
import Num from '../assets/utils/num';

export default {
  setOperation: ({ commit }, data) => {
    commit(types.SET_OPERATION, data);
  },
  setRecommendList: ({ commit }, data) => {
    commit(types.SET_RECOMMEND_LIST, data);
  },
  setUser: ({ commit }, data) => {
    commit(types.SET_USER, data);
  },
  query163List: ({ commit }, data) => {
    commit(types.QUERY_163_LIST, data);
  },
  setUserList: ({ commit }, data) => {
    commit(types.SET_USER_LIST, data);
  },
  updateSearch: ({ commit }, data) => {
    commit(types.UPDATE_SEARCH, data);
  },
  updatePlayingList: ({ commit }, data) => {
    commit(types.UPDATE_PLAYING_LIST, data);
  },
  updateRandomList: ({ commit }) => {
    commit(types.UPDATE_RANDOM_LIST);
  },
  updatePlayingPercent: ({ commit }, data) => {
    commit(types.UPDATE_PLAYING_PERCENT, data);
  },
  updateShowCover: ({ commit }, data) => {
    commit(types.UPDATE_SHOW_COVER, data);
  },
  changeSearchQuery: ({ commit }, data) => {
    commit(types.CHANGE_SEARCH_QUERY, data);
  },
  changeShowComment: ({ commit }) => {
    commit(types.CHANGE_SHOW_COMMENT);
  },
  updateRadioInfo: ({ commit }, data) => {
    commit(types.UPDATE_RADIO_INFO, data);
  },
  updateDownSettingDialog: ({ commit }, data) => {
    commit(types.SHOW_DOWN_SETTING, data);
  },
  updateDownloadList: ({ commit }, data) => {
    commit(types.UPDATE_DOWNLOAD_LIST, data);
  },
  updateSelectedSongs: ({ commit }, data) => {
    commit(types.SELECT_SONGS, data);
  },
  updateShowList: ({ commit }, data) => {
    commit(types.UPDATE_SHOW_LIST, data);
  },
  searchMusic: ({ commit }, data) => {
    commit(types.SEARCH_MUSIC, data);
  },
  updateRandomHistory: ({ commit }, data) => {
    commit(types.UPDATE_RANDOM_HISTORY, data);
  },
  setDownLoading: ({ commit }, data) => {
    commit(types.SET_DOWNLOADING, data);
  },
  updateSongDetail: ({ commit }, data) => {
    commit(types.UPDATE_SONG_DETAIL, data);
  },
  playPrev: ({ commit }) => {
    commit(types.PLAY_PREV);
  },
  playNext: ({ commit }) => {
    commit(types.PLAY_NEXT);
  },
  updatePlayNow: ({ commit }, data) => {
    commit(types.UPDATE_PLAY_NOW, data);
  },
  updateAllSongs: ({ commit }, data) => {
    commit(types.UPDATE_ALL_SONGS, data);
  },
  // 更新播放状态
  updatePlayingStatus: ({ commit }, data) => {
    commit(types.UPDATE_PLAYING_STATUS, data);
  },
  updateAdd2DirInfo: ({ commit }, data) => {
    commit(types.UPDATE_ADD_DIR_INFO, data);
  }
}
