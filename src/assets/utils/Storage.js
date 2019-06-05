const localStorage = window.localStorage;

const Storage = {
  // 获取localStorage
  get: (key, toObj = false, d = '') => {
    if (typeof key === 'string') {
      let result = localStorage.getItem(key) || d;

      if (toObj) {
        result = JSON.parse(result);
      }
      return result;
    } else {
      const r = {};
      key.forEach(k => {
        r[k] = Storage.get(k, toObj, d);
      });
      return r;
    }
  },

  // 设置localStorage
  set: (key, value, toStr = false) => {
    if (typeof key === 'object') {
      Object.keys(key).forEach(k => {
        Storage.set(k, key[k], value);
      })
    } else if (typeof key === 'string') {
      let v = value;
      if (toStr) {
        v = JSON.stringify(v);
      }
      localStorage.setItem(key, v);
    }
  },

  // 如果没有就设置一个默认的
  setDefault: (key, value) => {
    if (typeof key === 'object') {
      Object.keys(key).forEach(k => Storage.setDefault(k, key[k]));
    } else if (typeof key === 'string') {
      if (!Storage.get(key)) {
        Storage.set(key, value);
      }
    }
  }
};

export default Storage;
