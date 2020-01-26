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
  updateDownSettingDialog: ({ commit }, data) => {
    commit(types.SHOW_DOWN_SETTING, data);
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
  // 更新评论信息
  updateCommentInfo: ({ commit }, data) => {
    commit(types.UPDATE_COMMENT_INFO, data);
  },
  updateDownload: ({ commit }, data) => {
    commit(types.UPDATE_DOWNLOAD, data);
  },
  setPersonFM: ({ commit }, data) => {
    commit(types.PERSON_FM, data);
  },
  updateQUserList: ({ commit }, data) => {
    commit(types.UPDATE_Q_USER_LIST, data);
  },
  updateMode: ({ commit }, data) => {
    commit(types.UPDATE_MODE, data);
  },
  setLoading: ({ commit }, data) => {
    commit(types.SET_LOADING, data);
  },
  setReading: ({ commit }, data) => {
    commit(types.SET_READING, data);
  }
}
