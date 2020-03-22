import apiList from './apiList';
import Storage from './Storage';
import { getQueryFromUrl } from './stringHelper';
import downReq from './download';
import timer from './timer';
import axios from 'axios';
import idMap from './idMap';
import $ from 'jquery';

axios.interceptors.response.use(data=> {
//==============  所有请求完成后都要执行的操作  ==================
  if (data.status && data.status == 200 && data.data.status == 'error') {
    return;
  }
  return data;
}, err=> {
  const url = err.config && err.config.url;
  if (!url) {
    return { code: 500 };
  }
  if (url.indexOf('/api/playlist/tracks') > -1 || url.indexOf('/api/like' > -1)) {
    switch (err.response.data.code) {
      case 502:
        return window.VUE_APP.$message.warning('歌曲已存在');
      case 401:
      case 512:
        return;
        // return window.VUE_APP.$message.error('大概是歌曲下线了');
    }
  }
  if (url.indexOf('/api/login/status') > -1) {
    return Promise.reject({});
  }
  if (url.indexOf('/api/user/record') > -1) {
    return window.VUE_APP.$message.warning('ta 不公开听歌排行哟');
  }
  if (url.indexOf('/api/simi/artist') > -1) {
    return window.VUE_APP.$message.warning('登录后可查看相似歌手');
  }
  return Promise.reject(err.response.data);
});

const request = (param) => {
  let obj = param;
  if (typeof param === 'string') {
    obj = { api: param };
  }
  const { method = 'get', api, data = {} } = obj;
  data._t = param.cache ? 0 : new Date().getTime();
  let url =  apiList[api];
  if (method === 'get') {
    url += `?${Object.keys(data).map((k) => `${k}=${encodeURI(data[k])}`).join('&')}`
  }
  return axios({
    method,
    url: '' + url,
    data,
  }).then((res) => {
    res.data = res.data || {};
    if (res.data.code === 200 || res.data.result === 100) {
      return res.data;
    } else if (res.data.result === 400) {
      window.VUE_APP.$message.error(res.data.data || res.data.errMsg);
    } else {
      throw({ data: res.data });
    }
  }, (err) => {
    if (err.msg || err.message) {
      window.VUE_APP.$message.error(err.msg || err.message);
    }
  });
};

// 获取歌单列表
export const getPlayList = async (id) => request({ api: 'LIST_DETAIL', data: { id }})
  .then(async (res) => {
    const { playlist } = res;
    const VUE_APP = window.VUE_APP;
    const store = VUE_APP.$store;
    const dispatch = store.dispatch;
    const allSongs = store.getters.getAllSongs;
    const userList = store.getters.getUserList;
    const isFav = String(id) === String(userList.favId);
    const { tracks } = playlist;
    const ids = [];
    const newSongObj = {};

    // 请求的太多的话返回的会不详细
    const favMap = {};
    const songs = tracks.map((s) => {
      if (!allSongs[s.id]) {
        const { al = {}, ar = [], id, name, mv, mvid } = s;
        newSongObj[s.id] = { al, ar: ar, id, name, mvid: mv || mvid };
        allSongs[s.id] = newSongObj[s.id];
        ids.push(s.id);
      }
      isFav && (favMap[s.id] = 1);
      return s.id;
    });
    isFav && dispatch('updateFavSongMap', { 163: favMap });
    dispatch('query163List', { songs, listId: id });
    dispatch('updateAllSongs', newSongObj);

    while (ids.length > 0) {
      querySongUrl(ids.splice(-300).join(','));
    }

    return res;
  });

// 获取qq音乐歌单列表
export const getQQPlayList = async (id) => request({ api: 'QQ_LIST_DETAIL', data: { id }})
  .then(async (res) => {
    const VUE_APP = window.VUE_APP;
    const dispatch = VUE_APP.$store.dispatch;
    const allSongs = VUE_APP.$store.getters.getAllSongs;
    const newSongObj = {};
    const ids = [];
    const isFav = String(id) === String(VUE_APP.$store.getters.getQUserList.favId);
    const favMap = {};
    const songs = res.data.songlist.map((item) => {
      const obj = {
        ...QQ2163(item),
        ...(allSongs[item.songmid] || {}),
      };
      isFav && (favMap[item.songmid] = 1);
      if (!obj.url) {
        ids.push(obj.id);
      }
      newSongObj[obj.id] = obj;
      return obj.id;
    });

    dispatch('query163List', { songs, listId: `qq${id}` });
    dispatch('updateAllSongs', newSongObj);
    isFav && dispatch('updateFavSongMap', { qq: favMap });
    while (ids.length > 0) {
      getQQUrls(ids.splice(-100));
    }
    return res.data;
  });

export const getMiguPlayList = async (id, pageno) => {
  try {
    const { data } = await request({
      api: 'MIGU_PLAYLIST',
      data: { id, pageno },
    });
    data.list = handleMiguSongs(data.list || []);
    return data;
  } catch {
    return {
      list: [],
      total: 0,
    }
  }
};

// 批量获取歌曲的url
const querySongUrl = (id) => request({
  api: 'SONG_URL',
  data: { id },
  cache: true,
}).then(({ data }) => {
  const VUE_APP = window.VUE_APP;
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  const dispatch = VUE_APP.$store.dispatch;

  const obj = {};
  const arr = [];
  const qqFinds = {};
  data.forEach((s) => {
    if (!s.url || s.fee === 1) {
      const song = allSongs[s.id];
      qqFinds[s.id] = `${song.name.replace(/\(|\)|（|）/g, ' ')} ${song.ar.map((a) => a.name).join(' ')}`
    }
    if (idMap[s.id]) {
      const { murl, guid, vkey } = Storage.get(['murl', 'guid', 'vkey']);
      obj[s.id] = {
        ...allSongs[s.id],
        br: 128000,
        qqId: idMap[s.id],
        // url: `${murl}M500${idMap[id]}.mp3?guid=${guid}&vkey=${vkey}&fromtag=8&uin=0`
      };
      getQQUrls([idMap[s.id]], s.id);
    }
    obj[s.id] = { ...allSongs[s.id], br: s.br, url: s.url }
  });
  if (Object.keys(qqFinds).length) {
    request({
      api: 'QQ_SONG_FINDS',
      method: 'post',
      data: {
        data: qqFinds,
      }
    }).then((res) => {
      const newObj = {};
      Object.keys(res.data).forEach((id) => {
        newObj[id] = {
          ...allSongs[id],
          url: res.data[id].url,
          qqId: res.data[id].songmid,
          br: 128000,
        };
      });
      dispatch('updateAllSongs', newObj);
    });
  }
  dispatch('updateAllSongs', obj);
  return {
    songs: obj,
    id,
  }
});

// 登录状态
export const loginStatus = async () => {
  const VUE_APP = window.VUE_APP;
  const dispatch = VUE_APP.$store.dispatch;
  const { shareId, shareCid, from } = getQueryFromUrl();

  getQQInfo(true);

  // 包含分享过来的歌曲
  if (shareId) {
    if (from === 'qq') {
      request({
        api: 'QQ_SONG_DETAIL',
        data: { songmid: shareId }
      }).then((res) => {
        handleQQSongs([res.data.track_info]);
        const allSongs = VUE_APP.$store.getters.getAllSongs;
        dispatch('updatePlayNow', allSongs[shareId]);
        dispatch('updatePlayingList', { list: [ shareId ] });
      })
    } else if (from === 'migu') {
      request({
        api: 'MIGU_SONG_INFO',
        data: { id: shareId.replace('migu_', ''), cid: shareCid }
      }).then((res) => {
        const ids = handleMiguSongs([res.data]);
        const allSongs = VUE_APP.$store.getters.getAllSongs;
        dispatch('updatePlayNow', allSongs[ids[0]]);
        dispatch('updatePlayingList', { list: ids });
      })
    } else {
      getSongsDetail(shareId)
        .then(() => {
          const allSongs = VUE_APP.$store.getters.getAllSongs;
          dispatch('updatePlayNow', allSongs[shareId]);
          dispatch('updatePlayingList', { list: [ shareId ] });
        })
    }
  }

  // 查询登录情况
  const res = await request('LOGIN_STATUS');
  if (!res) {
    // 没有登录的情况
    request('RECOMMEND_LIST')
      .then(({ result }) => {
        const listObj = {};
        const list = result.map((item) => {
          const { id, name = '', picUrl, trackCount, playCount } = item;
          listObj[item.id] = { id, name, trackCount, coverImgUrl: picUrl, playCount };
          return listObj[item.id];
        });
        dispatch('setRecommendList', { list, obj: listObj });
        getPlayList(list[0].id)
          .then(({ privileges }) => {
            const allSongs = VUE_APP.$store.getters.getAllSongs;
            const idList = privileges.map((s) => s.id);
            // 默认播放
            if (!shareId) {
              dispatch('updatePlayNow', allSongs[privileges[0].id]);
            } else {
              idList.unshift(shareId);
            }
            dispatch('updatePlayingList', { list: idList, id: list[0].id });
          })
      });
    return;
  }
  dispatch('setUser', res.profile);
  const uid = res.profile.userId;
  Storage.set('uid', uid);

  // 获取日推
  request('DAILY_RECOMMEND_SONGS')
    .then(({ recommend }) => {
      handleSongs(recommend);
      const songs = recommend.map((item) => item.id);
      dispatch('query163List', { songs, listId: 'daily' });

      const allSongs = VUE_APP.$store.getters.getAllSongs;
      // 默认播放日推
      if (!shareId) {
        dispatch('updatePlayNow', allSongs[songs[0]]);
      } else {
        songs.unshift(shareId);
      }
      dispatch('updatePlayingList', { list: songs, id: 'daily' });
    });

  // 日推歌单
  request('DAILY_RECOMMEND_LIST')
    .then(({ recommend }) => {
      const listObj = {};
      const list = recommend.map((item) => {
        const { id, name = '', picUrl, trackCount, creator, playCount } = item;
        listObj[item.id] = { id, name, trackCount, coverImgUrl: picUrl, creator, playCount };
        return listObj[item.id];
      });
      dispatch('setRecommendList', { list, obj: listObj });
    });

  // 获取歌单列表
  getMyList(uid, true);
};

// 初始化获取qq音乐歌单、喜欢的歌曲等信息
export const getQQInfo = async (getFav) => {
  const id = Storage.get('qqId');
  if (!id) {
    Storage.set('haveQCookie', '0');
    return;
  }
  const haveCookie = await checkCookie();
  const dispatch = window.VUE_APP.$store.dispatch;
  if (haveCookie.success && haveCookie.data.data) {
    dispatch('updateFavSongMap', { qq: haveCookie.data.data.mid || {} });
  }
  getQQUserSonglist(id);
};

// 获取qq用户歌单
export const getQQUserSonglist = async (id) => {
  const res = await request({
    api: 'QQ_USER_SONG_LIST',
    data: {
      id,
      ownCookie: Number(Storage.get('haveQCookie') === '1'),
    }
  });
  const qUserList = {
    list: [],
    obj: {},
  };
  res.data.list.forEach((k) => {
    if (!k.tid) {
      return;
    }
    const obj = {
      id: k.tid,
      dirid: k.dirid,
      name: k.diss_name,
      coverImgUrl: k.diss_cover,
      trackCount: k.song_cnt,
    };
    if (k.dirid === 201) {
      qUserList.favId = k.tid;
    }
    qUserList.list.push(obj);
    qUserList.obj[k.tid] = obj;
  });
  window.VUE_APP.$store.dispatch('updateQUserList', qUserList);
};

// 获取我的歌单列表
export const getMyList = async (uid = Storage.get('uid'), getFav, id) => {
  const { playlist } = await request({ api: 'USER_LIST', data: { uid }});
  const listObj = {};
  const list = playlist.map((item) => {
    const { id, name = '', coverImgUrl, trackCount, subscribed, creator, playCount } = item;
    listObj[item.id] = { id, name, trackCount, coverImgUrl, subscribed, creator, playCount };
    return listObj[item.id];
  });
  window.VUE_APP.$store.dispatch('setUserList', { list, obj: listObj, favId: list[0].id });

  // 获取我喜欢的歌单
  getFav && getPlayList(playlist[0].id, true);
  id && getPlayList(id);
};

// 咪咕搜索请求
const searchMiguReq = async ({ keywords: keyword, type, pageNo: page }) => {
  const VUE_APP = window.VUE_APP;
  const dispatch = VUE_APP.$store.dispatch;
  const search = VUE_APP.$store.getters.getSearch;
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  if (page > (search.totalPage || 1)) {
    return;
  }
  const obj = {
    1: {
      type: 'song',
      key: 'songs',
      total: 'total',
    },
    10: {
      type: 'album',
      key: 'albums',
      total: 'total',
    },
    100: {
      type: 'singer',
      key: 'artists',
      total: 'artistCount',
    },
    1000: {
      type: 'playlist',
      key: 'playlists'
    }
  }[type];
  const res = await request({
    api: 'MIGU_SEARCH',
    data: {
      type: obj.type,
      pageno: page,
      keyword,
    }
  });
  const resultList = [];
  const querySongIds = [];
  const { list, totalPage } = res.data;
  switch (obj.type) {
    case 'song':
      const newObj = {};
      list.forEach((o) => {
        const obj = migu2163(o);
        if (!allSongs[obj.id]) {
          newObj[obj.id] = {
            ...allSongs[obj.id],
            ...obj,
          };
          querySongIds.push({ id: obj.miguId, cid: obj.cid, url: obj.url });
        }
        resultList.push(obj.id);
      });
      dispatch('updateAllSongs', newObj);
      break;
    case 'singer':
      list.forEach((item) => {
        item.picUrl = item.picUrl || 'http://p3.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg?param=120y120';
        resultList.push({
          from: 'migu',
          ...item,
        })
      });
      break;
    case 'album':
      list.forEach((item) => {
        resultList.push({
          from: 'migu',
          id: item.id,
          name: item.name,
          picUrl: item.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg?param=300y300',
        })
      });
      break;
    case 'playlist':
      list.forEach((item) => {
        resultList.push({
          from: 'migu',
          id: item.id,
          name: item.name,
          playCount: item.playCount,
          trackCount: item.songCount,
          coverImgUrl: item.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg?param=300y300',
        })
      });
      break;
    default: break;
  }
  if (querySongIds.length > 0) {
    getMiguUrl(querySongIds);
  }

  const searchResult = {
    loading: false,
  };
  searchResult[obj.key] = page > 1 ? [...(search[obj.key] || []), ...resultList] : resultList;
  searchResult.totalPage = totalPage;
  dispatch('updateSearch', searchResult)
};

// 获取咪咕音乐的播放链接和专辑封面
export const getMiguUrl = async (idArr) => {
  if (idArr.length === 0)
    return;
  const VUE_APP = window.VUE_APP;
  const dispatch = VUE_APP.$store.dispatch;
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  const miguUrlInfo = Storage.get('miguUrlInfo', true, '{}');
  const reqIds = [];

  const newObj = {};
  idArr.forEach(({ id, cid, url }) => {
    id = String(id).replace('migu_', '');
    const uInfo = miguUrlInfo[id];
    const miguId = `migu_${id}`;
    if (url || uInfo) {
      const al = {
        picUrl: uInfo && uInfo.pic,
        ...((allSongs[miguId] || {}).al || {}),
      };
      al.picUrl = al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg';
      newObj[miguId] = {
        ...allSongs[miguId],
        url: url || uInfo['128k'],
        br: 128000,
        al,
        miguUrl: uInfo,
      }
    } else {
      reqIds.push({ id, cid });
    }
  });
  dispatch('updateAllSongs', newObj);
  if (reqIds.length > 0) {
   reqIds.forEach(({ id, cid }) => {
     request({
       api: 'MIGU_URL_GET',
       data: { id, cid, needPic: 1 }
     }).then((res) => {
       miguUrlInfo[id] = res.data;
       Storage.set('miguUrlInfo', miguUrlInfo, true);
       const song = allSongs[`migu_${id}`];
       dispatch('updateSongDetail', {
         ...song,
         br: 128000,
         url: res.data['128k'],
         miguUrl: res.data,
         al: {
           ...song.al,
           picUrl: res.data.pic,
         }
       });

     });
   })
  }
};

// 搜索请求
export const searchReq = async ({ keywords, type = 1, pageNo = 1, platform }) => {
  const VUE_APP = window.VUE_APP;
  const dispatch = VUE_APP.$store.dispatch;

  if (!keywords) {
    return dispatch('updateSearch', { keywords, type, pageNo, loading: false, songs: [], artists: [], total: 0 });
  }

  if (platform === 'qq')
    return searchQQReq({ keywords, type, pageNo });

  if (platform === 'migu')
    return searchMiguReq({ keywords, type, pageNo });

  const allSongs = VUE_APP.$store.getters.getAllSongs;
  dispatch('updateSearch', { keywords, type, pageNo, loading: true });
  const res = await request({
    api: '163_SEARCH',
    data: {
      keywords,
      offset: (pageNo - 1)   * 30,
      type,
    },
    cache: true,
  });
  const obj = {};
  const search = VUE_APP.$store.getters.getSearch;
  res.result.songs = (res.result.songs || []).map((s) => {
    if (!allSongs[s.id]) {
      obj[s.id] = {
        id: s.id,
        name: s.name,
        ar: s.artists || s.ar,
      };
    }
    return s.id;
  });

  if (pageNo > 1) {
    res.result.songs = [ ...(search.songs || []), ...(res.result.songs || []) ];
    res.result.artists = [ ...(search.artists || []), ...(res.result.artists || []) ];
    res.result.albums = [ ...(search.albums || []), ...(res.result.albums || []) ];
    res.result.playlists = [ ...(search.playlists || []), ...(res.result.playlists || []) ];
  }
  if (search.keywords === keywords) {
    dispatch('updateSearch', { ...res.result, loading: false, total: res.result.songCount || res.result.artistCount || res.result.playlistCount || res.result.albumCount });
  }
  dispatch('updateAllSongs', obj);

  // 如果是搜索歌曲的，且存在没有加入过 allSongs 的歌曲
  const ids =res.result.songs.join(',');
  if (!ids) {
    return;
  }

  // 获取歌曲的详细信息，搜索到的数据格式和这个接口里的一些字段不一样，而且没有专辑封面这种东西
  getSongsDetail(ids);
};

// qq搜索请求
const searchQQReq = async ({ keywords: key, pageNo, type }) => {
  const VUE_APP = window.VUE_APP;
  const dispatch = VUE_APP.$store.dispatch;
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  const search = VUE_APP.$store.getters.getSearch;
  dispatch('updateSearch', { loading: true });

  const obj = {
    1: {
      type: 0,
      key: 'songs',
      total: 'total',
    },
    10: {
      type: 8,
      key: 'albums',
      total: 'total',
    },
    100: {
      type: '9',
      key: 'artists',
      total: 'artistCount',
    },
    1000: {
      type: 2,
      key: 'playlists'
    }
  }[type];
  const res = await request({
    api: 'QQ_SEARCH',
    data: {
      key,
      t: obj.type,
      pageNo,
    }
  });

  const { list, total, type: strType } = res.data;
  let resultList = [];

  // 搜索歌曲
  if (type === 1) {
    const newObj = {};
    resultList = list.map((item) => {
      const songObj = QQ2163(item);
      newObj[songObj.id] = {
        ...allSongs[songObj.id],
        ...songObj,
      };
      return songObj.id;
    });
    dispatch('updateAllSongs', newObj);
    getQQUrls(resultList);
  }

  // 搜索专辑
  if (type === 10) {
    resultList = list.map((item) => ({
      from: 'qq',
      id: item.albumID,
      mid: item.albumMID,
      name: item.albumName,
      picUrl: item.albumPic,
    }))
  }

  // 搜索歌手
  if (type === 100) {
    resultList = list.map((item) => ({
      from: 'qq',
      id: item.singerID,
      mid: item.singerMID,
      name: item.singerName,
      picUrl: item.singerPic,
    }))
  }

  // 搜索歌单
  if (type === 1000) {
    resultList = list.map((item) => ({
      from: 'qq',
      id: item.dissid,
      name: item.dissname,
      creator: item.creator,
      playCount: item.listennum,
      trackCount: item.song_count,
      coverImgUrl: item.imgurl,
    }))
  }

  const searchResult = {
    loading: false,
  };
  searchResult[obj.key] = pageNo > 1 ? [...(search[obj.key] || []), ...resultList] : resultList;
  searchResult.total = total;
  dispatch('updateSearch', searchResult)
};

export const getSongsDetail = (ids) => (
  request({
    api: 'SONG_DETAIL',
    data: { ids },
    cache: true,
  }).then(({ songs }) => handleSongs(songs))
);

export const QQ2163 = (item) => {
  const {
    albumid,
    albummid,
    albumname,
    strMediaMid,
    singer,
    songmid,
    songid,
    songname,
    url,
    vid,
  } = item;
  return {
    ar: singer,
    br: 128000,
    al: {
      id: albumid,
      mid: albummid,
      name: albumname,
      picUrl: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albummid}.jpg`,
    },
    mvid: vid,
    name: songname,
    id: songmid,
    mid: songmid,
    songid,
    from: 'qq',
    url,
  };
};

export const migu2163 = ({
  id,
  cid,
  name,
  artists: ar,
  url,
  picUrl = 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg',
  album: al,
}) => ({
  from: 'migu',
  id: `migu_${id}`,
  miguId: id,
  url,
  cid,
  ar,
  al: {
    picUrl,
    ...(al || {}),
  },
  name,
  br: 128000,
});

// 批量处理 咪咕音乐的歌曲信息
export const handleMiguSongs = (list) => {
  const allSongs = window.VUE_APP.$store.getters.getAllSongs;
  const dispatch = window.VUE_APP.$store.dispatch;
  const obj = {};
  const getUrlArr = [];
  const ids = list.map(item => {
    const newItem = migu2163(item);
    if (!allSongs[newItem.id]) {
      obj[newItem.id] = newItem;
      getUrlArr.push(newItem);
    }
    return newItem.id;
  });
  dispatch('updateAllSongs', obj);
  getMiguUrl(getUrlArr);
  return ids;
};

// 处理获取到的歌曲，把他们存到 allSongs 并获取链接
export const handleSongs = (songs) => (
  new Promise((resolve, reject) => {
    const VUE_APP = window.VUE_APP;
    const obj = {};
    const allSongs = VUE_APP.$store.getters.getAllSongs;
    const ids = [];
    songs.forEach((s) => {
      obj[s.id] = {
        ...(allSongs[s.id] || {}),
        al: (s.al || s.album),
        ar: s.ar || s.artists,
        name: s.name,
        id: s.id,
        mvid: s.mvid || s.mv,
      };
      allSongs[s.id] = obj[s.id];
      if (!allSongs[s.id].url) {
        ids.push(s.id);
      }
    });
    VUE_APP.$store.dispatch('updateAllSongs', obj);
    while (ids.length > 0) {
      querySongUrl(ids.splice(-500).join(','));
    }
    setTimeout(() => resolve(songs));
  })
);

const likeQQMusic = (id) => {
  const message = VUE_APP.$message;
  if (Storage.get('haveQCookie') !== '1') {
    return message.warning('请先前往设置页设置 Cookie');
  }
  const store= VUE_APP.$store;
  const favSongMap = store.getters.getFavSongMap;
  const allSongs = store.getters.getAllSongs;
  const like = !Boolean(favSongMap.qq[id]);
  const data = { dirid: 201, mid: id, id: allSongs[id].songid };
  const qUserList = store.getters.getQUserList;
  let api = like ? 'QQ_SONG_LIST_ADD' : 'QQ_SONG_LIST_REMOVE';
  request({
    api,
    data,
  }).then((res) => {
    const allList = store.getters.getAllList;
    let songs = allList[`qq${qUserList.favId}`] || [];
    if (like) {
      songs.unshift(id);
    } else {
      songs = songs.filter((v) => v !== id);
    }
    favSongMap.qq[id] = Number(like);
    store.dispatch('updateFavSongMap', favSongMap);
    store.dispatch('query163List', { songs, listId: `qq${qUserList.favId}` });
    message.success(like ? '爱上！' : '爱过～');
  }, (err) => {
    message.error(err.errMsg);
  })
};

// 喜欢音乐
export const likeMusic = (id) => {
  window.event && window.event.stopPropagation();
  const VUE_APP = window.VUE_APP;
  const message = VUE_APP.$message;
  const store= VUE_APP.$store;
  const favSongMap = store.getters.getFavSongMap;
  const allList = store.getters.getAllList;
  const userList = store.getters.getUserList;
  const allSongs = store.getters.getAllSongs;
  if (allSongs[id].from === 'qq') {
    return likeQQMusic(id);
  }
  const like = !Boolean(favSongMap['163'][id]);
  request({
    api: 'LIKE_MUSIC',
    data: { id, like },
  }).then((res) => {
    if (res && res.code === 200) {
      const songs = allList[userList.favId];
      if (like) {
        message.success('爱上！');
        songs.unshift(id);
        favSongMap['163'][id] = 1;
        store.dispatch('query163List', { songs, listId: userList.favId });
        store.dispatch('updateFavSongMap', favSongMap);
      } else {
        message.success('爱过～');
        favSongMap['163'][id] = 0;
        store.dispatch('query163List', { songs: songs.filter((s) => s !== id), listId: userList.favId });
        store.dispatch('updateFavSongMap', favSongMap);
      }
      getMyList(Storage.get('uid'), true);
    } else {
      // window.VUE_APP.$message.error('大概是歌曲下线了')
    }
  }, (err) => {
    // window.VUE_APP.$message.error('大概是歌曲下线了')
  })
};

export const getQQUrls = (arr, sid) => {
  const id = arr.filter((item) => !!item);
  request({
    api: 'QQ_GET_URLS',
    data: { id },
  }).then((res) => {
    const allSongs = window.VUE_APP.$store.getters.getAllSongs;
    const newObj = {};
    Object.keys(res.data).forEach((k) => {
      const song = allSongs[sid || k] || { id: k, from: 'qq', br: 128000, };
      if (song.url) {
        return;
      }
      song.url = res.data[k];
      song.br = 128000;
      song.qqId = k;
      newObj[song.id] = song;
    });
    window.VUE_APP.$store.dispatch('updateAllSongs', newObj);
  })
};

// 获取高品质歌曲的
export const getHighQualityUrl = async (id, type, updateSong) => {
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  const song = allSongs[id];
  if (!song.url) {
    return '';
  }
  let [url, br, songEndType] = ['', song.br, br > 320000 ? 'flac' : 'mp3'];

  if (String(type) !== '128') {
    if (song.qqId) {
      const typeArr = ['flac', '320', '128'];
      let i = typeArr.indexOf(type);
      while (i < typeArr.length && !url)  {
        try {
          const mediaIdMatch = song.url.match(/(C4|F0|M8|M5|A0)00(.+)\.(m4a|flac|mp3)/);
          const mediaId = mediaIdMatch ? mediaIdMatch[2] : '';
          const urlReq = await request({
            api: 'QQ_DOWN_URL',
            data: { id: song.qqId, type, mediaId }
          });
          if (urlReq.result === 100) {
            url = urlReq.data;
            songEndType = {
              320: 'mp3',
              128: 'mp3',
              flac: 'flac',
            }[type];
            br = {
              320: 320000,
              128: 128000,
              flac: 960000,
            }[type];
          }
        } catch (err) {
          // console.error(`获取歌曲高品质链接错误${err.message}`);
        }
        i += 1;
        type = typeArr[i];
      }
    }
    // 别的网站下载会有跨域问题
    url = url.replace(/^(.+)qq.com/, 'http://122.226.161.16/amobile.music.tc.qq.com');

    if (song.miguId) {
      url = '';
      const typeArr = ['flac', '320', '128'];
      const miguUrlInfo = Storage.get('miguUrlInfo', true, '{}');
      let urlInfo = miguUrlInfo[song.miguId];
      if (!urlInfo) {
        urlInfo = await request({
          api: 'MIGU_URL_GET',
          data: { id: song.miguId, cid: song.cid }
        });
        urlInfo = urlInfo.data;
      }
      let i = typeArr.indexOf(type);
      const tArr = [
        { end: 'flac', key: 'flac', br: 960000 },
        { end: 'mp3', key: '320k', br: 320000 },
        { end: 'mp3', key: '128k', br: 128000 },
      ];
      while (i < typeArr.length && !url) {
        url = urlInfo[tArr[i].key];
        songEndType = tArr[i].end;
        br = tArr[i].br;
      }
      url = encodeURI(url);
      // migu 的有跨域问题，所以在服务器上用 nginx 配以下代理
      url = url.replace('tyst.migu.cn', `${window.location.host}/miguSongs`);
    }
  }
  url = url || song.url;
  if (updateSong) {
    VUE_APP.$store.dispatch('updateSongDetail', {
      url,
      br,
    })
  }
  return {
    url,
    songEndType,
    br,
  }
};

// 下载
export const download = async (id, songName, forceReq) => {
  window.event && window.event.stopPropagation();
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  const song = allSongs[id];
  const dispatch = VUE_APP.$store.dispatch;

  if (!song.url) {
    return VUE_APP.$message.warning('没有这首歌呀');
  }
  let songCid = song.cid;

  let { url, songEndType, br } = await getHighQualityUrl(id, Storage.get('downSize') || 'flac');

  const downId = `${new Date().getTime()}${id}`;
  const name = songName ? songName : `${song.ar.map((a) => a.name).join('、')}-${song.name}.${songEndType}`;

  let { repeatDown, download_info: downloadInfo } = Storage.get(['repeatDown', 'download_info']);
  downloadInfo = JSON.parse(downloadInfo);
  if (!repeatDown && !forceReq) {
    const song = downloadInfo.list.find((s) => s.songId === id && s.status === 'success');
    if (song) {
      VUE_APP.$message.info('这首下载过啦，过滤掉了');
      return dispatch('updateDownload', { status: 'initError', errMsg: '重复下载，自动过滤', from: (song.from || '163'), id: downId, name, songId: id, songCid, br })
    }
  }

  downReq(url, name, null, {
    init: (ajax) => {
      VUE_APP.$message.success('加入下载中');
      dispatch('updateDownload', { status: 'init', from: (song.from || '163'), id: downId, ajax, name, songId: id, br, songCid });
    },
    success: () => dispatch('updateDownload', { status: 'success', id: downId }),
    error: () => dispatch('updateDownload', { status: 'error', id: downId }),
    progress: (p, l, t) => dispatch('updateDownload', { status: 'progress', id: downId, p, l, t }),
  });
};

export const getPersonFM = () => (
  request('GET_PERSON_FM')
    .then((res) => handleSongs(res.data))
);

// 处理qq音乐的评论数据格式
export const handleQQComments = (list) => (list || []).map((obj) => ({
  commentId: obj.commentid,
  content: obj.middlecommentcontent ?
    (obj.middlecommentcontent.map((r) => `回复 ${r.replyednick}：${(r.subcommentcontent || '').replace(/\\n/g, '<br/>')}`).join(' //')) :
    (obj.rootcommentcontent || '').replace(/\\n/g, '<br/>'),
  time: obj.time * 1000,
  canDelete: Boolean(obj.enable_delete),
  liked: Number(obj.ispraise) === 1,
  userId: obj.encrypt_uin,
  beReplied: obj.middlecommentcontent ? [
    {
      content: (obj.rootcommentcontent || '').replace(/\\n/g, '<br/>'),
      user: {
        avatarUrl: '',
        userId: obj.rootcommentuin,
        nickname: (obj.rootcommentnick || '').replace('@', ''),
      }
    }
  ] : [],
  user: {
    userId: obj.uin,
    nickname: obj.nick,
    avatarUrl: obj.avatarurl,
  },
  likedCount: obj.praisenum,
}));

export const handleQQSongs = (list) => {
  const allSongs = window.VUE_APP.$store.getters.getAllSongs;
  const obj = {};
  const ids = [];
  list.forEach(({ singer, mid, id, name, mv = {}, album}) => {
    if (!allSongs[mid]) {
      album.picUrl = `https://y.gtimg.cn/music/photo_new/T002R300x300M000${album.mid}.jpg`;
      obj[mid] = {
        ar: singer,
        mid,
        id: mid,
        songid: id,
        name,
        mvid: mv.vid,
        from: 'qq',
        al: album,
      };
    }
    ids.push(mid);
  });

  window.VUE_APP.$store.dispatch('updateAllSongs', obj);

  getQQUrls(ids);
  return ids;
};

export const getMusicData = (url) => {
  try {
    if (!url) {
      return;
    }
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    window.AudioBufferSourceNode = audioCtx.createBufferSource();
    window.AnalyserNode = audioCtx.createAnalyser();
    window.musicDataMap = {0: [0]};
    window.readNewMusic = true;
    const { AudioBufferSourceNode, AnalyserNode } = window;
    AnalyserNode.fftSize = Number(Storage.get('drawMusicNum') || 64) * 2;
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer'; // 设置数据类型为arraybuffer
    request.onload = function() {
      const audioData = request.response;
      audioCtx.decodeAudioData(
        audioData,
        (buffer) => {
          AudioBufferSourceNode.buffer = buffer;
          AudioBufferSourceNode.connect(AnalyserNode);
          AudioBufferSourceNode.start();
          window.AnalyserNode = AnalyserNode;
          window.AudioBufferSourceNode = AudioBufferSourceNode;
        },
        (e) => {
          window.readNewMusic = false;
          if (VUE_APP.$store.getters.isPlaying) {
            VUE_APP.$store.dispatch('setReading', false);
          }
        });
    };
    request.onerror = function () {
      window.readNewMusic = false;
      if (VUE_APP.$store.getters.isPlaying) {
        VUE_APP.$store.dispatch('setReading', false);
      }
    };
    request.send();
  } catch (err) {
    window.readNewMusic = false;
    if (VUE_APP.$store.getters.isPlaying) {
      VUE_APP.$store.dispatch('setReading', false);
    }
  }
};

// 校验 Cookie 是否过期
export const checkCookie = async () => {
  Storage.set('haveQCookie', '0');
  let uin = document.cookie.match(/\suin=([^;]+)(;|$)/);
  if (uin && uin[1]) {
    uin = uin[1].replace(/\D/g, '');
  } else {
    uin = null;
  }
  if (!uin) {
    return {
      success: false,
      message: 'cookie 格式错误',
    }
  }
  try {
    const result = await request('QQ_SONG_LIST_MAP');
    Storage.set('qqId', uin);
    Storage.set('haveQCookie', '1');
    return {
      success: true,
      data: result,
    }
  } catch (data) {
    return {
      success: false,
      data: data.data,
    }
  }
};

// 从服务器获取 Cookie
export const getCookie = async (id) => {
  const res = await request({
    api: 'QQ_GET_COOKIE',
    data: {
      id,
    }
  });
  if (res && res.result === 100) {
    const result = await checkCookie();
    if (!result.success) {
      VUE_APP.$message.error('Cookie 错误或过期')
    } else {
      VUE_APP.$message.success('获取 Cookie 成功');
    }
  }
};

export default request;