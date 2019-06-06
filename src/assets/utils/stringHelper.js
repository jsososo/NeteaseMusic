import Storage from './Storage';
import down from './download';
/*
* 从浏览器url的search里获取query值
*
* @params search: url的search（ 包括 '?' ）, 必填
* @params key: 想要筛选得到的值， 选填（如果未填，返回一个包含所有query信息的object）
*
* */
export function getQueryFromUrl(key, search = window.location.href) {
  try {
    const sArr = search.split('?');
    let s = '';
    if (sArr.length > 1) {
      s = sArr[1];
    } else {
      return key ? undefined : {};
    }
    const querys = s.split('&');
    const result = {};
    querys.forEach((item) => {
      const temp = item.split('=');
      result[temp[0]] = decodeURI(temp[1]);
    });
    return key ? result[key] : result;
  } catch (err) {
    // 除去search为空等异常
    return key ? '' : {};
  }
}

export function changeUrlQuery(obj, baseUrl = window.location.href, update = true) {
  const query = getQueryFromUrl(baseUrl);
  const url = baseUrl.split('?')[0];

  const newQuery = {...query, ...obj};
  let queryArr = [];
  Object.keys(newQuery).forEach((key) => {
    if (newQuery[key] !== undefined && newQuery[key] !== '') {
      queryArr.push(`${key}=${newQuery[key]}`);
    }
  });
  if (update) {
    window.location = queryArr.length > 0 ? `${url}?${queryArr.join('&')}` : url;
  } else {
    return `${url}?${queryArr.join('&')}`;
  }
}

/*
* 将长的字符串切割成短的，以 ...结尾
* */
export function shortString(str, length = 20) {
  return str.length > length ? `${str.substr(0, length - 3)}...` : str;
}

export function handleLyric(str, type, obj) {
  const dom = document.createElement('div');
  dom.innerHTML = str;
  const arr = dom.innerHTML.split('\n');
  arr.forEach((item) => {
    const time = item.match(/^\[(\d+:\d+.\d+)\]/);
    if (time) {
      const timeArr = time[1].split(':');
      const s = item.replace(time[0], '');
      if (!s) {
        return;
      }
      const timeKey = Number(timeArr[0] * 60000) + Number(timeArr[1]) * 1000
      obj[timeKey] = obj[timeKey] || {};
      obj[timeKey][type] = s;
    }
  })
  return obj;
}

export const formatMap = {
  size128: {
    val: '128k',
      s: 'M500',
      e: '.mp3',
      content: 'audio/mpeg',
  },
  size320: {
    val: '320k',
      s: 'M800',
      e: '.mp3',
      content: 'audio/mpeg',
  },
  sizeape: {
    val: '无损ape',
      s: 'A000',
      e: '.ape',
      content: 'audio/ape',
  },
  sizeflac: {
    val: '无损flac',
      s: 'F000',
      e: '.flac',
      content: 'audio/flac',
  }
}

export function getSongUrl(v, isDown, onlyHigh) {
  let {listen_size, murl, vkey, guid, down_size, down_high} = Storage.get(['listen_size', 'vkey_expire', 'murl', 'vkey', 'guid', 'down_size', 'down_high']);
  let startSize = listen_size;
  const formatArr = ['sizeflac', 'size320', 'size128'];
  if (isDown) {
    formatArr[0] = down_high;
    startSize = down_size === 'high' ? down_high : down_size;
  }
  const startFormat = formatArr.indexOf(startSize);
  const formatKey = formatArr.slice(startFormat, 4).find(k => v[k]);

  const {s, e, content} = formatMap[formatKey];
  if (!isDown) {
    v.formatKey = formatKey;
    return `${murl}${s}${v.mediamid}${e}?guid=${guid}&vkey=${vkey}&fromtag=8&uin=0`;
  } else {
    v.downAfter = e;
    v.content = content;
    // url, 歌名，是否仅下载高品质
    return [
      `${murl}${s}${v.mediamid}${e}?guid=${guid}&vkey=${vkey}&fromtag=8&uin=0`,
      `${v.artist}-${v.title}${v.downAfter}`,
      onlyHigh && (startSize !== formatKey),
      v.content,
    ];
  }
}

export function download(v, onlyHigh = Storage.get('down-setting-only-high'), repeat = Storage.get('down-setting-repeat')) {
  if (!v.objectId) {
    return;
  }
  const VUE_APP = window.VUE_APP
  const dispatch = VUE_APP.$store.dispatch;
  if (onlyHigh === '' || repeat === '') {
    return dispatch('updateDownSettingDialog', '您有下载配置还未完善，请先选择（可在下载页修改配置）');
  }
  // trueUrl 是通过原有的下载链接点击了重新下载所得到的，所以不需要重新计算了
  const [url, name, highLimit] = v.trueUrl ? [v.trueUrl, v.name, false] : getSongUrl(v, true, onlyHigh === '1');
  const time = new Date().getTime();
  const id = `${v.objectId}-${time}`;

  // 列表内已下载的不再下载了
  if (repeat === '0' &&
    VUE_APP.$store.getters.getDownList.list.find(item => item.objectId === v.objectId && item.status === 'success')) {
    return dispatch('updateDownloadList', { id, name, url, objectId: v.objectId, time, status: 'error', errKey: 'repeat', reason: '已下载过，不再重复下载'});
  }

  // 仅下载高品质
  if (highLimit) {
    return dispatch('updateDownloadList', { id, name, url, objectId: v.objectId, time, status: 'error', errKey: 'ONLY_HIGH', reason: '没有高品质的音乐'});
  }

  down(url, name, null, {
    init: (ajax) => dispatch('updateDownloadList', { id, name, url, objectId: v.objectId, ajax, time, status: 'init' }),
    progress: (...arg) => dispatch('updateDownloadList', { id, status: 'down', progress: { percent: arg[0], loaded: arg[1], total: arg[2] }}),
    success: () => dispatch('updateDownloadList', { id, status: 'success', okTime: new Date().getTime() }),
    error: () => dispatch('updateDownloadList', { id, name, url, objectId: v.objectId, time, status: 'error', errKey: 'DOWLOAD_ERROR', reason: '下载中出错了', downloading: true }),
  });
}