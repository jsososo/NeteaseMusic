import apiList from './apiList';
import Storage from './Storage';
import { getQueryFromUrl } from './stringHelper';
import downReq from './download';
import timer from './timer';
import axios from 'axios';
import idMap from './idMap';

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
        return window.VUE_APP.$message.error('大概是歌曲下线了');
    }
  }
  if (url.indexOf('/api/login/status') > -1) {
    return Promise.reject({});
  }
  if (url.indexOf('/api/user/record') > -1) {
    return window.VUE_APP.$message.warning('ta 不公开听歌排行哟');
  }
  if (url.indexOf('/api/simi/artist') > -1) {
    return window.VUE_APP.$message.warning('登陆后可查看相似歌手');
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
    } else {
      throw({ data: res.data });
    }
  }, (err) => {
    if (err.msg || err.message) {
      window.VUE_APP.$message.error(err.msg || err.message);
    }
  });
};

// 获取播放列表
export const getPlayList = async (id) => request({ api: 'LIST_DETAIL', data: { id }})
  .then(async (res) => {
    const { playlist } = res;
    const VUE_APP = window.VUE_APP;
    const dispatch = VUE_APP.$store.dispatch;
    const allSongs = VUE_APP.$store.getters.getAllSongs;
    const { tracks } = playlist;
    const ids = [];
    const newSongObj = {};

    // 请求的太多的话返回的会不详细
    const songs = tracks.map((s) => {
      if (!allSongs[s.id]) {
        const { al = {}, ar = [], id, name } = s;
        newSongObj[s.id] = { al, ar: ar, id, name };
        allSongs[s.id] = newSongObj[s.id];
        ids.push(s.id);
      }
      return s.id;
    });
    dispatch('query163List', { songs, listId: id });
    dispatch('updateAllSongs', newSongObj);

    while (ids.length > 0) {
      querySongUrl(ids.splice(-500).join(','));
    }

    return res;
  });

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
  data.forEach((s) => {
    if (!s.url || s.fee === 1) {
      const song = allSongs[s.id];
      searchQQ(`${song.name.replace(/\(|\)|（|）/g, ' ')} ${song.ar.map((a) => a.name).join(' ')}`, s.id);
    }
    if (idMap[s.id]) {
      const { murl, guid, vkey } = Storage.get(['murl', 'guid', 'vkey']);
      obj[s.id] = {
        ...allSongs[s.id],
        br: 128000,
        qqId: idMap[s.id],
        url: `${murl}M500${idMap[id]}.mp3?guid=${guid}&vkey=${vkey}&fromtag=8&uin=0`
      };
    }
    obj[s.id] = { ...allSongs[s.id], br: s.br, url: s.url }
  });
  dispatch('updateAllSongs', obj);
  return {
    songs: obj,
    id,
  }
});

// 登陆状态
export const loginStatus = async () => {
  const VUE_APP = window.VUE_APP;
  const dispatch = VUE_APP.$store.dispatch;
  const mid = getQueryFromUrl('mid');

  if (mid) {
    getSongsDetail(mid)
      .then(() => {
        const allSongs = VUE_APP.$store.getters.getAllSongs;
        dispatch('updatePlayNow', allSongs[mid]);
        dispatch('updatePlayingList', { list: [ mid ] });
      })
  }

  // 查询登陆情况
  const res = await request('LOGIN_STATUS');
  if (!res) {
    // 没有登陆的情况
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
            if (!mid) {
              dispatch('updatePlayNow', allSongs[privileges[0].id]);
            } else {
              idList.unshift(mid);
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
      if (!mid) {
        dispatch('updatePlayNow', allSongs[songs[0]]);
      } else {
        songs.unshift(mid);
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
  getFav && getPlayList(playlist[0].id);
  id && getPlayList(id);
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
    dispatch('updateSearch', { ...res.result, loading: false, total: res.result.songCount || res.result.artistCount || res.result.playlistCount });
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
      type: '',
      key: 'songs',
      total: 'songCount',
    },
  }[type];
  const res = await request({
    api: 'QQ_SEARCH',
    data: {
      key,
      type: obj.type,
      pageNo,
    }
  });

  const { list, total, type: strType } = res.data;

  const songList = list.map((item) => {
    const {
      albumid,
      albummid,
      albumname,
      strMediaMid,
      singer,
      size128,
      songmid,
      songid,
      songname,
    } = item;
    const { murl, guid, vkey } = Storage.get(['murl', 'guid', 'vkey']);
    const songObj = {
      ar: singer,
      br: 128000,
      al: {
        id: albumid,
        mid: albummid,
        name: albumname,
        picUrl: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albummid}.jpg`,
      },
      name: songname,
      id: strMediaMid,
      mid: songmid,
      songid,
      from: 'qq',
      url: size128 ? `${murl}M500${strMediaMid}.mp3?guid=${guid}&vkey=${vkey}&fromtag=8&uin=0` : '',
    };

    allSongs[songObj.id] = songObj;
    return songObj.id;
  });
  dispatch('updateAllSongs', allSongs);

  const searchResult = {
    loading: false,
  };
  searchResult[obj.key] = pageNo > 1 ? [...(search[obj.key] || []), ...songList] : songList;
  searchResult[obj.total] = total;
  dispatch('updateSearch', searchResult)
};

export const getSongsDetail = (ids) => (
  request({
    api: 'SONG_DETAIL',
    data: { ids },
    cache: true,
  }).then(({ songs }) => handleSongs(songs))
);

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

// 喜欢音乐
export const likeMusic = (id) => {
  window.event.stopPropagation();
  const VUE_APP = window.VUE_APP;
  const message = VUE_APP.$message;
  const store= VUE_APP.$store;
  const allList = store.getters.getAllList;
  const userList = store.getters.getUserList;
  const like = allList[userList.favId].indexOf(id) === -1;
  request({
    api: 'LIKE_MUSIC',
    data: { id, like },
  }).then((res) => {
    if (res && res.code === 200) {
      const songs = allList[userList.favId];
      if (like) {
        message.success('爱上！');
        songs.unshift(id);
        store.dispatch('query163List', { songs, listId: userList.favId });
      } else {
        message.success('爱过～');
        store.dispatch('query163List', { songs: songs.filter((s) => s !== id), listId: userList.favId });
      }
      getMyList(Storage.get('uid'), true);
    } else {
      window.VUE_APP.$message.error('大概是歌曲下线了')
    }
  }, (err) => {
    window.VUE_APP.$message.error('大概是歌曲下线了')
  })
};

// 查询qq音乐
const searchQQ = async (val, id) => {
  const { murl, guid, vkey } = Storage.get(['murl', 'guid', 'vkey']);
  let mediaId = '';

  if (idMap[id]) {
    mediaId = idMap[id];
  } else {
    const res = await request({
      api: 'QQ_SEARCH',
      data: {
        pageNo: 1,
        pageSize: 1,
        key: val,
      }
    });
    const song = res.data.list[0] || {};
    if (song.media_mid && song.size128) {
      mediaId = song.media_mid;
    } else {
      return;
    }
  }

  return window.VUE_APP.$store.dispatch('updateSongDetail', { id, qqId: mediaId, br: 128000, url: `${murl}M500${mediaId}.mp3?guid=${guid}&vkey=${vkey}&fromtag=8&uin=0` });
};

export const getQQVkey = () => {
  request('QQ_VKEY')
    .then((res) => {
      const { domain, guid, vkey } = res.data;
      if (!vkey) {
        return getQQVkey();
      }
      Storage.set({
        guid,
        vkey,
        vkey_expire: timer().from(90, 'm').str('YYYYMMDDHHmm'),
        murl: 'http://183.131.60.16/amobile.music.tc.qq.com/',
      });
    });
};

const JSONP = (url) => {
  const jsonp = document.createElement("script");
  jsonp.type = "text/javascript";
  jsonp.src = url;
  document.getElementsByTagName("head")[0].appendChild(jsonp);
  setTimeout(() => {
    document.getElementsByTagName("head")[0].removeChild(jsonp)
  },500)
};

// 下载
export const download = async (id) => {
  window.event.stopPropagation();
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  const song = allSongs[id];
  const { murl, guid, vkey } = Storage.get(['murl', 'guid', 'vkey']);
  const dispatch = VUE_APP.$store.dispatch;

  if (!song.url) {
    return VUE_APP.$message.warning('没有这首歌呀');
  }
  let url = '';

  if (song.qqId) {
    url = `${murl}M500${song.qqId}.mp3?guid=${guid}&vkey=${vkey}&fromtag=8&uin=0`;
  } else {
    const res = await request({
      api: 'SONG_URL',
      data: { id },
      cache: true,
    });
    url = res.data[0].url;
  }

  const downId = `${new Date().getTime()}${id}`;
  const name = `${song.ar.map((a) => a.name).join('、')}-${song.name}.${(song.br > 320000) ? 'flac' : 'mp3'}`;
  downReq(url, name, null, {
    init: (ajax) => {
      VUE_APP.$message.success('加入下载中');
      dispatch('updateDownload', { status: 'init', id: downId, ajax, name, songId: id, br: song.br });
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
    (obj.middlecommentcontent.map((r) => `回复 ${r.replyednick}：${r.subcommentcontent.replace(/\\n/g, '<br/>')}`).join(' //')) :
    obj.rootcommentcontent.replace(/\\n/g, '<br/>'),
  time: obj.time * 1000,
  beReplied: obj.middlecommentcontent ? [
    {
      content: obj.rootcommentcontent.replace(/\\n/g, '<br/>'),
      user: {
        avatarUrl: '',
        userId: obj.rootcommentuin,
        nickname: obj.rootcommentnick.replace('@', ''),
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

export default request;