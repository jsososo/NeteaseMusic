const arrayHelper = {
  /*
  *  删除数组内相同的元素（简单类型）
  * */
  delDuplicate: (arr1, arr2 = []) => {
    const arr = [...arr1, ...arr2];
    const result = [];
    arr.forEach((item) => {
      if (result.indexOf(item) < 0) {
        result.push(item);
      }
    });
    return result;
  },
  /*
  *  删除数组内指定键值相同的元素
  * */
  delDuplicateObj: (arr, keys) => {
    const arrLen = [];
    const result = [];
    arr.forEach((item) => {
      if (typeof item === 'object') {
        let valLen = item;
        for (let i = 0; i < keys.length; i += 1) {
          valLen = valLen[keys[i]];
        }
        if (arrLen.indexOf(valLen) === -1) {
          arrLen.push(valLen);
          result.push(item);
        }
      }
    });
    return result;
  },
  /*
  *  把对象内的键值转换成数组
  * */
  objToArr: (obj) => {
    const result = [];
    Object.keys(obj).forEach((key) => {
      result.push(obj[key]);
    });
    return result;
  },
  /*
  *  判断数组内是有有相同的元素
  * */
  hasDuplicate: (arr1, arr2) => {
    return arrayHelper.getDuplicate(arr1, arr2).length !== 0;
  },
  /*
  *  获取两个数组内重复的元素
  * */
  getDuplicate: (arr1, arr2) => {
    const result = [];
    arr1.forEach((item) => {
      if (arr2.indexOf(item) > -1) {
        result.push(item);
      }
    });
    return result;
  },
};

export default arrayHelper;
