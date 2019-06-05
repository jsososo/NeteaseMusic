/*
*  自己做的一些时间相关的方法，需要注意的是，所有的月份都按照 1 - 12 月 传递
*
* */

import num from './num';

export const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

const Timer = (v = new Date(), strType) => {

  let value = v;

  try {
    if (strType && typeof strType === 'string') {
      const timeArr = [];
      const mapType = [
        ['YYYY', 'YY'],
        ['MM', 'M'],
        ['DD', 'D'],
        ['HH', 'H'],
        ['mm', 'm'],
        ['ss', 's'],
      ];
      let index = 0;
      // 循环每一种类型
      while (index < 8) {
        // 先判断长的格式，如果不存在再判断短的，如果都不存在则解析结束
        if (strType.indexOf(mapType[index][0]) > -1) {
          timeArr.push(Number(v.substr(strType.indexOf(mapType[index][0]), mapType[index][0].length)));
        } else if (strType.indexOf(mapType[index][1]) > -1) {
          timeArr.push(Number(v.substr(strType.indexOf(mapType[index][1]), mapType[index][1].length)));
          // YY格式需要前缀加上20
          if (strType.indexOf(mapType[index]) === 'YY') {
            timeArr[0] = Number('20' + v.substr(strType.indexOf('YY'), 2));
          }
          if (strType.indexOf(mapType[index]) === 'yy') {
            timeArr[0] = Number('20' + v.substr(strType.indexOf('yy'), 2));
          }
        } else {
          index += 6;
        }
        index++;
      }
      if (timeArr[1]) {
        timeArr[1]--;
      } else {
        timeArr[1] = 0;
      }
      value =  new Date(...timeArr);
    } else {
    }
  } catch (err) {
    value = new Date();
  }

  const date = new Date(value);

  /*
  *  将日期（时间戳和Date对象）转化为字符串
  *
  *  字符串格式转换为YYYY（年）MM（月）DD(日)HH(时)mm(分)ss(秒)
  *  MM表示01月，M表示1月，其他同理
  * */
  date.str = (s = 'YYYY-MM-DD') => {
    let str = s;
    str = str.replace('YYYY', date.year)
      .replace('yyyy', date.year)
      .replace('YY', String(date.year).substr(-2))
      .replace('yy', String(date.year).substr(-2))
      .replace('MM', formatNumber(date.month))
      .replace('M', date.month)
      .replace('DD', formatNumber(date.date))
      .replace('dd', formatNumber(date.date))
      .replace('D', date.date)
      .replace('d', date.date)
      .replace('HH', formatNumber(date.hour))
      .replace('H', date.hour)
      .replace('mm', formatNumber(date.minute))
      .replace('m', date.minute)
      .replace('ss', formatNumber(date.second))
      .replace('s', date.second);
    return str;
  };

  /*
  *  计算与_d之间的的时间间隔
  *
  *  @params _d: 时间截止
  *  @params output: 输出的时间格式 str || arr([Y, M, D, H, m, s])
  *  @params start: 输出为string时计时单位，eg. start = 2 表示输出几天前, start = 3 标识输出几分钟前
  * */
  date.to = (_d = Timer(), output = 'str', start = 0) => {
    const p = (_d.time - date.time) > 0;
    const _t = _d - date;

    let result = [
      num(_t / 31536000000, 0, p ? -1 : 1),
      (_d.str() === date.str()) ? 0 : num((((_d.year - date.year) * 12) + _d.month - date.month + ((_d.date - date.date) > 0 ? 0.5 : -0.5)), 0, p ? -1 : 1),
      num(_t / 86400000, 0, p ? -1 : 1),
      num(_t / 3600000, 0, p ? -1 : 1),
      num(_t / 60000, 0, p ? -1 : 1),
      num(_t / 1000, 0, p ? -1 : 1),
      _t,
    ];

    if (output === 'str') {
      let i = start;
      const timeMap = ['年', '个月', '天', '小时', '分钟', '秒', '毫秒'];
      while (result[i] !== undefined) {
        if (result[i]) {
          result = `${Math.abs(result[i])}${timeMap[i]}${p ? '后' : '前'}`;
          i += 10;
        }
        i += 1;
      }
      if (typeof result !== 'string') {
        result = '刚刚';
      }
    } else if (output === 'num') {
      return [result[start]] * (p ? -1 : 1);
    }
    return result;
  };

  /*
  *  获取年月日星期的信息
  * */
  date.year = date.getFullYear();
  date.month = date.getMonth() + 1;
  date.date = date.getDate();
  date.hour = date.getHours();
  date.minute = date.getMinutes();
  date.second = date.getSeconds();
  date.time = date.getTime();
  date.day = [
    {
      cn: '星期天',
      en: 'Sunday',
      short: '日',
      value: 0,
    },
    {
      cn: '星期一',
      en: 'Monday',
      short: '一',
      value: 1,
    },
    {
      cn: '星期二',
      en: 'Tuesday',
      short: '二',
      value: 2,
    },
    {
      cn: '星期三',
      en: 'Wednesday',
      short: '三',
      value: 3,
    },
    {
      cn: '星期四',
      en: 'Thursday',
      short: '四',
      value: 4,
    },
    {
      cn: '星期五',
      en: 'Friday',
      short: '五',
      value: 5,
    },
    {
      cn: '星期六',
      en: 'Saturday',
      short: '六',
      value: 6,
    },
  ][date.getDay()];
  date.todayStart = new Date(date.year, date.month - 1, date.date).getTime();
  date.todayEnd = new Date(date.year, date.month - 1, date.date + 1).getTime() - 1;

  /*
  *  获取周号。周号为，年-月-周
  *  其中周日为一周的起点。如果 1号为周一或周一以后，则这一周都算作上个月的周号中
  * */
  date.week = () => {
    const w = (date.date - date.day.value) / 7;
    if (w <= 0) {
      return Timer([date.year, date.month, 1]).from(-1).week();
    }
    return `${date.str('yyyyMM')}${Math.round(w + 0.49)}`;
  };

  // 返回date对象
  date.dateObj = new Date(date.time);

  /*
  *  从当天开始的时间推算
  *
  *  @params time: 时间间隔
  *  @params type: 间隔单位
  * */
  date.from = (time = 0, type = 'D') => {
    const timeArr = [
      date.year,
      date.month - 1,
      date.date,
      date.hour,
      date.minute,
      date.second,
    ];
    const typeStr = 'YMDHms';
    if (typeStr.indexOf(type) < 0) {
      return date;
    }
    timeArr[typeStr.indexOf(type)] += time;
    return Timer(new Date(...timeArr));
  };

  return date;
};

/*
*  获得某年某月的日历
*
*  @params y: 年份（fullYear）
*  @params m: 月份（1-12）
* */
export const getCalendar = (y, m) => {
  let D = Timer([y, m]);
  // 空白的一周
  const emptyWeek = new Array(7);
  emptyWeek.fill(0);
  // 最后输出的日历
  const C = [];

  do {
    emptyWeek[D.day.value] = D.date;
    if (D.day.value === 6) {
      C.push([...emptyWeek]);
      emptyWeek.fill(0);
    }
    D = D.from(1);
  } while (D.month === m);
  if (emptyWeek.join('') !== '0000000') {
    C.push(emptyWeek);
  }
  return C;
};

export default Timer;
