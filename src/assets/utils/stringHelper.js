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
    const times = item.match(/\[\d+:\d+.\d+\]/g);
    if (times) {
      times.forEach((time) => {
        const timeArr = time.replace(/\[|\]/g, '').split(':');
        const s = item.replace(times.join(''), '');
        if (!s) {
          return;
        }
        const timeKey = Number(timeArr[0] * 60000) + Number(timeArr[1]) * 1000;
        obj[timeKey] = obj[timeKey] || {};
        obj[timeKey][type] = s;
      });
    }
  });
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
