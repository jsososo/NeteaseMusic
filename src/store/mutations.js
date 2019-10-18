import * as types from './mutationsTypes';
import Storage from "../assets/utils/Storage";
import ArrHelper from '../assets/utils/arrayHelper';
import Num from '../assets/utils/num';

export default {
  [types.SET_OPERATION](state, data) {
    state.operation = data;
  },
  [types.SET_USER](state, data) {
    state.user = data;
  },
  [types.UPDATE_SEARCH](state, data) {
    state.search = {
      ...state.search,
      ...data,
    }
  },
  [types.UPDATE_PLAYING_PERCENT](state, data) {
    state.playingPercent = data;
    state.downloading = false;
  },
  [types.QUERY_163_LIST](state, data) {
    const { allList } = state;
    const { songs = [], more = false, listId } = data;

    if (listId) {
      if (more) {
        allList[listId] = [ ...(allList[listId]), ...songs ];
      } else {
        allList[listId] = songs;
      }
      state.allList = { ...allList };
    }
  },
  [types.SET_USER_LIST](state, data) {
    state.userList = { ...state.userList, ...data };
  },
  [types.SET_RECOMMEND_LIST](state, data) {
    state.recommendList = { ...state.recommendList, ...data };
  },
  [types.CHANGE_SEARCH_QUERY](state, data) {
    state.searchQuery = { ...state.searchQuery, ...data };
  },
  [types.CHANGE_SHOW_COMMENT](state) {
    state.showComment = !state.showComment;
  },
  [types.UPDATE_SHOW_LIST](state, data) {
    if (data.more) {
      state.showList = [...state.showList, ...data.list];
    } else {
      state.showList = data.list;
    }
    data.dissid && (state.sysSongs[data.dissid] = state.showList);
  },
  [types.UPDATE_ALL_SONGS](state, data) {
    const { allSongs, playNow, playingList } = state;
    state.allSongs = { ...state.allSongs, ...data };
    if (playNow.id && JSON.stringify(playNow) !== JSON.stringify(allSongs[playNow.id])) {
      state.playNow = allSongs[playNow.id];
    }
    if (ArrHelper.hasDuplicate(Object.keys(data), playingList.raw.join(',').split(','))) {
      playingList.trueList = playingList.raw.filter((id) => state.allSongs[id].url || allSongs[id].qqId);
      window.VUE_APP.$store.dispatch('updateRandomList');
    }
  },
  // 搜索歌曲
  [types.SEARCH_MUSIC](state, data) {
    const { search } = data;
    const { userList } = state;
    const { selected } = userList;
    let findList = selected.songs || [];
    const RE = new RegExp(search.replace(/\s/g, ''), 'i');
    state.showList = findList.filter((s) => (
      s.name.replace(/\s/g, '').match(RE) || s.ar.map((a) => a.name).join('').replace(/\s/g, '').match(RE) || s.al.name.replace(/\s/g, '').match(RE)
    ))
  },
  // 上一首
  [types.PLAY_PREV](state) {
    const {playingList, allSongs, playNow} = state;
    const {history, index, trueList, random} = playingList;
    const {id} = playNow;
    const orderType = Storage.get('orderType');
    const order = orderType;
    if (index > 0) {
      playingList.index -= 1;
      return state.playNow = allSongs[history[playingList.index]];
    }

    let i = 0;
    const list = order === 'suiji' ? random : trueList;
    i = list.indexOf(id);
    i -= 1;
    if (i === -1) {
      i = list.length - 1;
    }
    state.playNow = allSongs[list[i]];
    state.playingList.history.unshift(state.playNow.id);
  }
  ,
  // 下一首
  [types.PLAY_NEXT](state) {
    const { playingList, allSongs, playNow } = state;
    const orderType = Storage.get('orderType');
    const order = orderType;
    const { history, index, trueList, random } = playingList;
    const { id } = playNow;

    playingList.index += 1;
    if (index < history.length - 1) {
      return state.playNow = allSongs[history[playingList.index]];
    }

    let i = 0;
    switch (order) {
      case 'suiji':
        i = random.indexOf(id);
        i += 1;
        playingList.history.push(id);
        if (i === trueList.length) {
          i = 0;
        }
        if (i === (trueList.length - 1) || i === 0) {
          window.VUE_APP.$store.dispatch('updateRandomList');
        }
        return state.playNow = allSongs[random[i]];
      default:
        i = trueList.indexOf(id);
        i += 1;
        if (i === trueList.length) {
          i = 0;
        }
        playingList.history.push(id);
        return state.playNow = allSongs[trueList[i]];
    }

  },
  // 更新随机播放历史
  [types.UPDATE_RANDOM_HISTORY](state, data) {
    state.randomHistory = data || {
      list: [],
      index: -1,
    };
  },
  // 更新播放器信息
  [types.UPDATE_PLAYER_INFO](state, data) {
    state.playerInfo = { ...state.playerInfo, ...data};
  },
  // loading状态
  [types.SET_DOWNLOADING](state, data) {
    state.downloading = data;
  },
  // 更新歌曲信息
  [types.UPDATE_SONG_DETAIL](state, data) {
    const { id } = data;
    state.allSongs[id] = {
      ...(state.allSongs[id]),
      ...data,
    };
    if (id === state.playNow.id) {
      state.playNow = state.allSongs[id];
    }
    state.allSongs = { ...state.allSongs };
    if (state.playingList.raw.indexOf(data) > -1) {
      state.playingList.trueList = state.raw.filter((id) => (state.allSongs[id].url || state.allSongs[id].qqId));
      window.VUE_APP.$store.dispatch('updateRandomList');
    }
  },
  [types.UPDATE_PLAYING_STATUS](state, data) {
    state.playing = data;
  },
  // 更新正在播放的音乐
  [types.UPDATE_PLAY_NOW](state, data) {
    const { playingList, playNow, isPersonFM } = state;
    if (playNow.id) {
      playingList.history.push(playNow.id);
      playingList.index += 1;
    }
    state.playNow = data;
    if (!isPersonFM) {
      window.VUE_APP.$store.dispatch('updateRandomList');
    }
  },
  [types.UPDATE_PLAYING_LIST](state, { list, more, id, heart = false }) {
    const { playingList, allSongs } = state;
    if (more) {
      // 增量
      playingList.raw = [ ...playingList.raw, ...list ];
    } else {
      // 非增量
      playingList.raw = list;
      playingList.history = [];
      playingList.index = 0;
    }
    state.isPersonFM = false;
    state.playingListId = id;
    state.heartMode = heart;
    playingList.trueList = playingList.raw.filter((v) => allSongs[v].url || allSongs[v].qqId);
    window.VUE_APP.$store.dispatch('updateRandomList');
  },
  [types.UPDATE_RANDOM_LIST](state) {
    const { playingList, playNow } = state;
    playingList.random = [ ...playingList.trueList ];
    // 保证当前歌曲第一个，剩下歌曲随机顺序
    playingList.random.sort((a, b) => {
      if (a === playNow.id) {
        return -1;
      }
      if (b === playNow.id) {
        return 1;
      }
      return Math.random() - 0.5;
    });
  },
  [types.UPDATE_SHOW_COVER](state, data) {
    state.showCoverImg = data;
  },

  // 更新评论信息
  [types.UPDATE_COMMENT_INFO](state, data) {
    state.commentInfo = data;
  },

  // 更新下载记录
  [types.UPDATE_DOWNLOAD](state, data) {
    if (!data) {
      // 第一次进来的渲染
      const downloadInfo = Storage.get('download_info', true);
      downloadInfo.count = 0;
      downloadInfo.list.forEach((obj) => {
        if (obj.status === 'progress') {
          obj.status = 'error';
          obj.errMsg = '下载被中断了';
          delete obj.ajax;
          delete obj.p;
          delete obj.t;
          delete obj.l;
        }
      });
      state.downloadInfo = downloadInfo;
    } else {
      const { id, p, l, t, ajax, status, errMsg, name, songId, br, from } = data;
      const { downloadInfo } = state;
      const d = downloadInfo.list.find((item) => item.id === id);
      // 这是其他的更新下载状态
      switch (status) {
        case 'init':
          downloadInfo.list.unshift({ status, from, id, startTime: new Date().getTime(), ajax, name, songId, br });
          downloadInfo.count++;
          break;
        case 'success':
          d.status = 'success';
          d.endTime = new Date().getTime();
          delete d.ajax;
          delete d.p;
          delete d.t;
          delete d.l;
          break;
        case 'error':
          d.errMsg = errMsg || '未知错误';
          d.endTime = new Date().getTime();
          delete d.ajax;
          delete d.p;
          delete d.t;
          delete d.l;
          break;
        case 'progress':
          d.p = Num(p * 100, 2);
          d.t = t;
          d.l = l;
          d.status = 'progress';
          break;
        case 'clear':
          downloadInfo.list = downloadInfo.list.filter((o) => ['init', 'progress'].indexOf(o.status) > 0);
          break;
        case 'clearError':
          downloadInfo.list = downloadInfo.list.filter((o) => o.status !== 'error');
          break;
        case 'abort':
          d.ajax.abort();
          d.errMsg ='主动结束';
          d.endTime = new Date().getTime();
          d.status = 'error';
          delete d.ajax;
          delete d.p;
          delete d.t;
          delete d.l;
          break;
        case 'abortAll':
          downloadInfo.list.forEach((item) => {
            if (['init', 'progress'].indexOf(item.status) > 0) {
              item.ajax.abort();
              item.errMsg ='主动结束';
              item.status = 'error';
              item.endTime = new Date().getTime();
              delete item.ajax;
              delete item.p;
              delete item.t;
              delete item.l;
            }
          })
        default: break;
      }
      downloadInfo.count = downloadInfo.list.filter((o) => ['init', 'progress'].indexOf(o.status) > -1).length;
      Storage.set('download_info', downloadInfo, true);
      state.downloadInfo = { ...downloadInfo };
    }
  },
  [types.PERSON_FM](state, data) {
    const { playingList } = state;
    if (!state.isPersonFM) {
      playingList.raw = data;
      playingList.history = [];
      playingList.index = 0;
      playingList.random = data;
      playingList.trueList = data;
    } else {
      const newList = ArrHelper.delDuplicate(playingList.raw || [], data);

      playingList.raw = newList;
      playingList.trueList = newList;
      playingList.random = newList;
    }
    state.playingListId = '';
    state.isPersonFM = true;
  },

  // 更新 qq 用户歌单
  [types.UPDATE_Q_USER_LIST](state, data) {
    state.qUserList = data;
  },

  [types.UPDATE_MODE](state, data) {
    state.mode = data;
  }
}