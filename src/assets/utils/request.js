import apiList from './apiList';
import Storage from './Storage';
import {getQueryFromUrl, handleLyric} from './stringHelper';
import downReq from './download';
import timer from './timer';
import axios from 'axios';

axios.interceptors.response.use(data=> {
//==============  所有请求完成后都要执行的操作  ==================
  if (data.status && data.status == 200 && data.data && data.data.status == 'error') {
    return;
  }
  return data;
}, err=> {
  const url = err.config && err.config.url;
  if (!url) {
    return { code: 500 };
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

const request = (param, platform) => {
  let obj = param;
  if (typeof param === 'string') {
    obj = { api: param };
  }
  const { method = 'get', api, data = {} } = obj;
  data._t = param.cache ? 0 : new Date().getTime();
  data._p = data._p || platform;
  let url =  apiList[api];
  if (method === 'get') {
    url += `?${Object.keys(data).map((k) => `${k}=${encodeURI(data[k])}`).join('&')}`
  } else {
    url += '?_t=' + data._t;
  }
  return axios({
    method,
    url: '' + url,
    data,
    headers: {
      'Host-Check': btoa(timer().str('YYYYMMDD')),
    }
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

// 登录状态
export const loginStatus = async () => {
  const VUE_APP = window.VUE_APP;
  const dispatch = VUE_APP.$store.dispatch;
  const { shareId, shareCid, from = '163' } = getQueryFromUrl();

  getQQInfo();

  // 包含分享过来的歌曲
  if (shareId) {
    request({
      api: 'SONG_INFO',
      data: { id: shareId, cid: shareCid, _p: from }
    }).then(({ data }) => handleSongs([ data ]))
      .then((list) => {
        const allSongs = VUE_APP.$store.getters.getAllSongs;
        list[0] && dispatch('updatePlayNow', allSongs[list[0]]);
        dispatch('updatePlayingList', { list });
      })
  }

  // 查询登录情况
  const res = await request('LOGIN_STATUS');
  let uid;
  // 根据是否登陆选择日推还是推荐歌单
  let func = () => (
    request({
      api: 'RECOMMEND_PLAYLIST',
      data: { login: 0, _p: 163 },
    }).then(({ data }) => data[0] && getPlaylist(data[0].id, '163'))
  );
  if (res) {
    dispatch('setUser', res.profile);
    uid = res.profile.userId;
    func = () => getDaily('163');
    Storage.set('uid', uid);
  }

  let { songs: list, listId } = await func();
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  if (!shareId) {
    dispatch('updatePlayNow', allSongs[list[0]]);
  } else {
    list.unshift(shareId);
  }
  dispatch('updatePlayingList', { list, listId });

  if (res) {
    const { listIds } = await getUserList(uid, '163');
    listIds[0] && getPlaylist(listIds[0], '163');
  }
};

// 获取日推
export const getDaily = async (platform, retry) => {
  const VUE_APP = window.VUE_APP;
  const dispatch = VUE_APP.$store.dispatch;

  try {
    const res = await request('DAILY_PLAYLIST', platform);
    if (!res.data) {
      if (!retry) {
        getDaily(platform, true);
      }
      return;
    }
    const listInfo = {
      songs: await handleSongs(res.data),
      listId: `${platform}_daily`
    }
    dispatch('updateList', listInfo);
    return listInfo;
  } catch (err) {
    console.log('获取日推失败 =。=', err);
    return {
      songs: [],
      listId: `${platform}_daily`,
    }
  }
}

// 获取用户歌单
export const getUserList = async (id, platform) => {
  let myId = '', ownCookie = 0;
  const { VUE_APP, cookieObj } = window;
  switch (platform) {
    case '163':
      myId = Storage.get('uid');
      break;
    case 'qq':
      myId = cookieObj.uin || '';
      ownCookie = Storage.get('haveQCookie') || '0';
      break;
  }
  const isMe = String(myId) === String(id);
  const userList = VUE_APP.$store.getters.getUserList;
  const dispatch = VUE_APP.$store.dispatch;

  const { data } = await request({
    api: 'USER_PLAYLIST',
    data: {
      ownCookie,
      id,
      _p: platform,
    }
  });
  const mineMap = {}, subMap = {};
  if (isMe) {
    userList[platform] = {
      list: [],
      favId: '',
      favAId: '',
      mine: {},
      sub: {},
      obj: {},
    };
  }
  const listIds = data.map((p) => {
    if (isMe) {
      // 关注列表
      userList[platform].obj[p.listId] = p;
      subMap[p.listId] = 1;
    }
    if (String(p.userId) === myId) {
      // 如果是用户自己创建的，就从关注列表上去掉
      mineMap[p.listId] = 1;
      delete subMap[p.listId];
    }
    return p.listId;
  });
  if (isMe && data[0]) {
    userList[platform].list = listIds;
    userList[platform].favId = data[0].id;
    userList[platform].favListId = listIds[0];
    userList[platform].mine = mineMap;
    userList[platform].sub = subMap;
    dispatch('setUserList', { ...userList });
  }
  return { list: data, listIds };
}

// 校验 Cookie 是否过期
export const checkCookie = async () => {
  Storage.set('haveQCookie', '0');
  const cookieObj = {};
  document.cookie.split(';').forEach(str => {
    const [key, val] = str.split('=');
    cookieObj[key.replace(/\s/g, '')] = val;
  })

  // 微信
  if (Number(cookieObj.login_type) === 2) {
    cookieObj.uin = cookieObj.wxuin;
  }
  cookieObj.uin = (cookieObj.uin || '').replace(/\D/g, '');
  window.cookieObj = cookieObj;

  const { uin } = cookieObj;
  if (!uin) {
    return {
      success: false,
      message: 'cookie 格式错误',
    }
  }
  try {
    const result = await request({ api: 'QQ_SONG_LIST_MAP', data: { ownCookie: 1 }});
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

// 初始化获取qq音乐歌单、喜欢的歌曲等信息
export const getQQInfo = async () => {
  const id = Storage.get('qqId');
  if (!id) {
    Storage.set('haveQCookie', '0');
    return;
  }
  const haveCookie = await checkCookie();
  const dispatch = window.VUE_APP.$store.dispatch;
  if (haveCookie.success && haveCookie.data.data) {
    const dataMap = {};
    Object.keys(haveCookie.data.data.mid || {}).forEach((k) => dataMap[`qq_${k}`] = 1);
    dispatch('updateFavSongMap', { qq: dataMap });
    getDaily('qq');
  }
  getUserList(id, 'qq');
};

export const getPlaylist = async (id, platform) => {
  const { VUE_APP } = window;
  const dispatch = VUE_APP.$store.dispatch;
  const userList = VUE_APP.$store.getters.getUserList;
  id = String(id).replace(`${platform}_`, '');
  const { data = {} } = await request({
    api: 'PLAYLIST',
    data: {
      id,
      _p: platform,
    }
  });

  const songMap = {};
  data.songs = await handleSongs(data.list || [], (s) => songMap[s.aId] = 1);
  data.listId = `${platform}_${id}`;

  // 是喜欢的列表
  if (userList[platform] && userList[platform].favListId === data.listId) {
    dispatch('updateFavSongMap', { [platform]: songMap });
  }
  dispatch('updateList', data);
  return data;
}

// 搜索请求
export const searchReq = async ({ keywords, type = 1, pageNo = 1, platform }) => {
  const VUE_APP = window.VUE_APP;
  const dispatch = VUE_APP.$store.dispatch;

  if (!keywords) {
    return dispatch('updateSearch', { keywords, type, pageNo, loading: false, songs: [], artists: [], total: 0 });
  }

  try {
    const { data: { list, key, total }} = await request({
      api: 'SEARCH',
      data: {
        key: keywords,
        pageNo,
        type,
        _p: platform
      }
    });
    const search = VUE_APP.$store.getters.getSearch;
    if (!Number(type)) {
      search.list = await handleSongs(list);
    } else {
      search.list = list;
    }
    (pageNo > 1) && (search.list = [ ...search[`${key}s`], ...search.list ]);

    dispatch('updateSearch', { loading: false, [`${key}s`]: search.list, total });
  } catch {
    return VUE_APP.$message.error('搜索出错');
  }
};

export const getUrlBatch = async (id, platform) => {
  const res = await request({
    api: 'BATCH_URL',
    method: 'post',
    data: {
      id,
      _p: platform
    }
  });
  const obj = {};
  const findMap = {};
  const VUE_APP = window.VUE_APP;
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  id.split(',').forEach(v => {
    const aId = `${platform}_${v}`
    const song = allSongs[`${platform}_${v}`];
    if (song) {
      findMap[aId] = {
        key: `${song.name.replace(/\(|\)|（|）/g, ' ')} ${song.ar.map((a) => a.name).join(' ')}`,
        id: aId,
        duration: song.duration,
      };
    }
  })
  Object.keys(res.data || {}).forEach((id) => {
    const aId = `${platform}_${id}`;
    delete findMap[aId];
    obj[aId] = {
      ...allSongs[aId],
      br: 128000,
      url: res.data[id],
      pUrl: res.data[id],
    }
  })
  if (Object.keys(findMap).length > 0) {
    request({
      api: 'SONG_FIND',
      method: 'post',
      data: {
        list: Object.values(findMap),
        _p: platform,
      }
    }).then((res) => {
      const newObj = {};
      Object.keys(res.data || {}).forEach((id) => {
        const { url, bId, bPlatform } = res.data[id];
        newObj[id] = {
          ...allSongs[id],
          url,
          pUrl: url,
          bId,
          bPlatform,
          br: 128000,
        };
      });
      VUE_APP.$store.dispatch('updateAllSongs', newObj);
    });
  }
  VUE_APP.$store.dispatch('updateAllSongs', obj);
}

// 处理获取到的歌曲，把他们存到 allSongs 并获取链接
export const handleSongs = (songs = [], func) => (
  new Promise((resolve) => {
    const VUE_APP = window.VUE_APP;
    const obj = {};
    const allSongs = VUE_APP.$store.getters.getAllSongs;
    const ids = [];
    let platform = ''
    songs.forEach((s) => {
      const aId = `${s.platform}_${s.id}`;
      s.aId = aId;
      func && func(s);
      if (allSongs[aId] && allSongs[aId].url) {
        return;
      }
      obj[aId] = s;
      if ((!allSongs[aId] || !allSongs[aId].url) && !s.url) {
        ids.push(s.id);
      } else {
        s.pUrl = (allSongs[aId] && allSongs[aId].pUrl) || s.url
      }
      platform = s.platform;
    });
    VUE_APP.$store.dispatch('updateAllSongs', obj);
    while (ids.length > 0) {
      getUrlBatch(ids.splice(-99).join(','), platform || '163');
    }
    resolve(songs.map(s => s.aId));
  })
);

// 喜欢音乐
export const likeMusic = (id) => {
  window.event && window.event.stopPropagation();
  const VUE_APP = window.VUE_APP;
  const message = VUE_APP.$message;
  const store= VUE_APP.$store;
  const {
    getFavSongMap: favSongMap,
    getAllList: allList,
    getAllSongs: allSongs,
    getUserList: userList,
    getUser: user,
  } = store.getters;

  const song = allSongs[id];
  const { mid, songid, id: trueId, platform } = song;
  const like = !Boolean(favSongMap[platform][id]);

  if (platform === 'migu') {
    return VUE_APP.$message.error('咪咕音乐暂不支持！');
  }

  let favFunc = () => {
    const listId = userList[platform].favListId;
    return request({
      api: 'PLAYLIST_TRACKS',
      data: { tracks: trueId, pid: listId.replace(`${platform}_`, ''), op: like ? 'add' : 'del'},
    }).catch((err) => {
      if (err.data && err.data.status === 200) {
        return err.data.body || err.data.data;
      }
    })
  }
  if (platform === 'qq') {
    if (Storage.get('haveQCookie') !== '1') {
      return message.warning('没有 cookie ！');
    }
    favFunc = () => {
      const data = { dirid: 201, mid, id: songid };
      let api = like ? 'QQ_SONG_LIST_ADD' : 'QQ_SONG_LIST_REMOVE';
      return request({ api, data });
    }
  } else {
    if (!user.userId) {
      return message.warning('没有登陆！');
    }
  }

  favFunc()
    .then((res) => {
      if (platform === '163' && res.code !== 200) {
        return message.error('失败了！');
      }
      const listId = userList[platform].favListId;
      const songs = allList[listId];
      if (like) {
        message.success('爱上！');
        favSongMap[platform][id] = 1;
        if (songs) {
          songs.unshift(id);
          store.dispatch('updateList', { songs, listId });
        }
        store.dispatch('updateFavSongMap', favSongMap);
      } else {
        message.success('爱过～');
        favSongMap[platform][id] = 0;
        store.dispatch('updateFavSongMap', favSongMap);
        if (songs) {
          store.dispatch('updateList', { songs: songs.filter((s) => s !== id), listId });
        }
      }
    })
};

// 获取高品质歌曲的
export const getHighQualityUrl = async (id, type, updateSong) => {
  const { VUE_APP } = window;
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  const song = allSongs[id] || updateSong || {};
  if (!song.url) {
    return '';
  }
  const idStr = (song.bId || id).replace(`${song.platform}_`, '');

  let url = song.url, br = song.br || 128000, songEndType = 'mp3';
  try {
    const res = await request({
      api: 'SINGLE_URL',
      data: {
        id: idStr,
        mediaId: song.mediaId,
        br: type,
        _p: song.bPlatform || song.platform,
      }
    });
    if (res.data && res.data.url) {
      url = res.data.url;
      br = res.data.br;
      if (br > 320000) {
        songEndType = 'flac';
      }
    }
  } catch (err) {
    console.log('获取url失败了 =.=', song.id, song.platform);
  }

  url = url.replace(/^(.+)qq.com/, 'http://122.226.161.16/amobile.music.tc.qq.com');
  url = url.replace('freetyst.nf.migu.cn', `${window.location.host}/miguSongs`);

  if (updateSong) {
    VUE_APP.$store.dispatch('updateSongDetail', {
      url,
      br,
      aId: song.aId,
    })
  }
  return {
    url,
    songEndType,
    br,
  }
};

// 下载
export const download = async (id, songName, forceReq, defaultSong) => {
  window.event && window.event.stopPropagation();
  const { VUE_APP } = window;
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  const song = defaultSong || allSongs[id];
  const dispatch = VUE_APP.$store.dispatch;

  if (!song.url) {
    return VUE_APP.$message.warning('没有这首歌呀');
  }
  let songCid = song.cId;

  let { url, songEndType, br } = await getHighQualityUrl(id, Storage.get('downSize') || 'flac', song);

  const downId = `${new Date().getTime()}${id}`;
  if (url.indexOf('.mp3') > -1) {
    songEndType = 'mp3';
  } else if (url.indexOf('.flac') > -1) {
    songEndType = 'flac';
  }
  let name = `.${songEndType}`;
  let { repeatDown, download_info: downloadInfo, downLyric } = Storage.get(['repeatDown', 'download_info', 'downLyric']);

  name = songName || getDownName(song, name);

  downloadInfo = JSON.parse(downloadInfo);
  if (!repeatDown && !forceReq) {
    const song = downloadInfo.list.find((s) => s.songId === id && s.status === 'success');
    if (song) {
      VUE_APP.$message.info('这首下载过啦，过滤掉了');
      return dispatch('updateDownload', { status: 'initError', errMsg: '重复下载，自动过滤', from: (song.from || '163'), id: downId, name, songId: id, songCid, br })
    }
  }

  downReq(url, name, null, song, {
    init: (ajax) => {
      VUE_APP.$message.success('加入下载中');
      dispatch('updateDownload', { status: 'init', from: (song.from || '163'), id: downId, ajax, name, songId: id, br, songCid, song, });
    },
    success: () => {
      if (downLyric === '1') {
        downLyricFunc(song);
      }
      dispatch('updateDownload', { status: 'success', id: downId });
    },
    error: () => dispatch('updateDownload', { status: 'error', id: downId }),
    progress: (p, l, t) => dispatch('updateDownload', { status: 'progress', id: downId, p, l, t }),
  });
};

export const downLyricFunc = async (obj) => {
  const { VUE_APP } = window;
  await queryLyric(obj.aId);
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  const song = allSongs[obj.aId] || obj;
  let lyric = song.rawLyric;
  if (!lyric) {
    return;
  }
  if (Storage.get('downLyricTrans') === '1' && song.rawTrans) {
    const lyricArr = lyric.split('\n');
    const transArr = song.rawTrans.split('\n');
    const result = [];
    lyricArr.forEach((str) => {
      result.push(str);
      const times = str.match(/\[\d+:\d+.\d+\]/);
      if (times) {
        const transStr = transArr.find((v) => v.indexOf(times[0]) > -1);
        transStr && result.push(transStr);
      }
    })
    lyric = result.join('\n');
  }
  downReq(lyric, getDownName(song, '.lrc'));
}

export const getDownName = (song, end = '') => {
  let artistName = (song.ar || []).map((a) => a.name).join('/');
  let name = '';
  switch (Storage.get('downMusicName')) {
    case '1':
      name = `${song.name}-${artistName}${end}`;
      break;
    case '2':
      name = `${song.name}${end}`;
      break;
    default:
      name = `${artistName}-${song.name}${end}`;
      break;
  }
  return name;
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

// 从服务器获取 Cookie
export const getCookie = async (id) => {
  const { VUE_APP } = window;
  Storage.set('qqId', id);
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

// 收藏/取消收藏 歌单
export const collectPlaylist = async ({ platform, id, listId }) => {
  const { VUE_APP } = window;
  window.event.stopPropagation();
  const userList = VUE_APP.$store.getters.getUserList;
  if (!userList[platform]) {
    return VUE_APP.$message.error('未登陆或没有Cookie');
  }
  const isSub = Boolean(userList[platform].sub[listId]);
  let success = false;
  switch (platform) {
    case 'migu':
      VUE_APP.$message.warning('咪咕音乐暂不支持！');
      return;
    case 'qq':
      try {
        await request({
          api: 'QQ_COLLECT_SONGLIST',
          data: {
            id,
            op: isSub ? 2 : 1,
          }
        });
        success = true;
      } catch {
        return VUE_APP.$message.error('收藏失败');
      }
      break;
    case '163':
      try {
        await request({
          api: 'SUBSCRIBE_PLAYLIST',
          data: {
            id,
            t: Number(!isSub),
          }
        });
        success = true;
      } catch {
        return VUE_APP.$message.error('收藏失败');
      }
      break;
  }

  if (success) {
    VUE_APP.$message.success(`${isSub ? '取消' : '收藏'}成功！`);
    userList[platform].sub[listId] = Number(!isSub);
    VUE_APP.$store.dispatch('setUserList', { ...userList });
  }

};

export const queryLyric = async (aId) => {
  const { VUE_APP } = window;
  const allSongs = VUE_APP.$store.getters.getAllSongs;
  const song = allSongs[aId];
  const { id, mid, cId, platform } = song;
  if (song.lyricObj) {
    return;
  }
  const { data: { lyric, trans }} = await request({
    api: 'LYRIC',
    data: {
      id: {
        163: id,
        qq: mid,
        migu: cId
      }[platform],
      _p: platform,
    }
  }).catch(() => ({ data: { lyric: '', trans: '' }}));
  let lyricObj = {};
  lyric && handleLyric(lyric, 'str', lyricObj);
  trans && handleLyric(trans, 'trans', lyricObj);
  !lyric && !trans && (
    lyricObj = {
      0: {
        str: '没有歌词哟，好好享受',
      },
    });
  VUE_APP.$store.dispatch('updateSongDetail', { lyric: lyricObj, aId, rawLyric: lyric, rawTrans: trans });
}

export default request;