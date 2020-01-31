const apiList = {
  '163_SEARCH': '/api/search',
  '163_LOGIN_PHONE': '/api/login/cellphone',
  '163_LOGIN_EMAIL': '/api/login',
  'LOGIN_STATUS': '/api/login/status',
  'USER_LIST': '/api/user/playlist',
  'LIST_DETAIL': '/api/playlist/detail',
  'SONG_DETAIL': '/api/song/detail',
  'SONG_URL': '/api/song/url',
  'GET_LYRIC': '/api/lyric',
  'CAPTCH_SENT': '/api/captch/sent',
  'CAPTCH_VERIFY': '/api/captch/verify',
  'GET_USER_DETAIL': '/api/user/detail',
  'MUSIC_COMMENTS': '/api/comment/music',
  'GET_QQ_VKEY': '//u.y.qq.com/cgi-bin/musicu.fcg?callback=jQuery331015138042840240584_1544498679284&data=%7B%22req_0%22%3A%7B%22module%22%3A%22vkey.GetVkeyServer%22%2C%22method%22%3A%22CgiGetVkey%22%2C%22param%22%3A%7B%22guid%22%3A%225339940689%22%2C%22songmid%22%3A%5B%220039MnYb0qxYhV%22%5D%2C%22songtype%22%3A%5B0%5D%2C%22uin%22%3A%22%22%2C%22platform%22%3A%2220%22%7D%7D%7D&jsonpCallback=getQQMusicUrl&callback=getQQMusicUrl&_=1544498679292',
  'DAILY_RECOMMEND_SONGS': '/api/recommend/songs', // 日推
  'DAILY_RECOMMEND_LIST': '/api/recommend/resource', // 日推歌单
  'RECOMMEND_LIST': '/api/personalized', // 未登录用户的推荐歌单
  'LIKE_MUSIC': '/api/like', // 喜欢音乐
  'LIKE_COMMENT': '/api/comment/like', // 评论点赞
  'PLAYLIST_TRACKS': '/api/playlist/tracks', // 歌单的增减操作
  'GET_SINGER_DESC': '/api/artist/desc', // 获取歌手描述
  'GET_SINGER_SONGS': '/api/artists', // 获取歌手的热门歌曲
  'GET_SINGER_ALBUMS': '/api/artist/album', // 获取歌手的转接
  'GET_HEART_MODE': '/api/playmode/intelligence/list', // 心动模式
  'GET_ALBUM': '/api/album', // 获取专辑信息
  'COMMENT': '/api/comment', // 发送、删除 评论
  'SIMI_ARTIST': '/api/simi/artist', // 相似歌手
  'SCROBBLE': '/api/scrobble', // 听歌打卡
  'GET_USER_RECORD': '/api/user/record', // 获取听歌记录
  'GET_FOLLOWS': '/api/user/follows', // 获取关注列表
  'GET_FOLLOWEDS': '/api/user/followeds', // 获取粉丝列表
  'GET_DJ_CATE_LIST': '/api/dj/catelist', // 获取电台分类
  'GET_DJ_RECOMMEND': '/api/dj/recommend/type', // 根据分类获取推荐的电台
  'GET_DJ_DETAIL': '/api/dj/detail', // 获取电台的详细信息
  'GET_DJ_SONGS': 'api/dj/program', // 获取电台的歌单
  'GET_PERSON_FM': 'api/personal_fm', // 获取私人fm
  'GET_MV_INFO': 'api/mv/detail', // 获取 mv 信息
  'GET_SIMI_MV': 'api/simi/mv', // 获取相似 mv

  'QQ_SEARCH': 'apiQ/search', // qq 音乐搜索
  'QQ_VKEY': 'apiQ/vkey', // qq音乐 vkey
  'QQ_LYRIC': 'apiQ/lyric', // qq音乐歌词
  'QQ_GET_COMMENT': 'apiQ/comment', // qq音乐获取评论
  'QQ_GET_URLS': 'apiQ/song/urls', // 获取 qq 音乐播放链接
  'QQ_SONG_FIND': 'apiQ/song/find', // 根据关键词去查找一首qq音乐中的歌
  'QQ_SONG_FINDS': 'apiQ/song/finds', // 批量的查找
  'QQ_SET_COOKIE': 'apiQ/user/setCookie', // 设置 cookie
  'QQ_USER_DETAIL': 'apiQ/user/detail', // 查询qq用户的歌单
  'QQ_LIST_DETAIL': 'apiQ/songlist', // qq 音乐歌单
  'QQ_SINGER_DESC': 'apiQ/singer/desc', // qq 歌手介绍
  'QQ_SINGER_SIM': 'apiQ/singer/sim', // qq 相似歌手
  'QQ_SINGER_SONGS': 'apiQ/singer/songs', // qq 歌手的热门歌曲
  'QQ_SINGER_ALBUMS': 'apiQ/singer/album', // qq 歌手的专辑
  'QQ_ALBUM': 'apiQ/album', // qq 专辑信息
  'QQ_ALBUM_SONGS': 'apiQ/album/songs', // qq 专辑歌曲
  'QQ_SONG_DETAIL': 'apiQ/song', // qq 歌曲详情
  'QQ_MV_INFO': 'apiQ/mv', // qq mv 信息,
  'QQ_MV_URL': 'apiQ/mv/url', // qq mv 播放链接
  'QQ_DOWN_URL': 'apiQ/song/url', // qq 下载歌曲链接
  'QQ_RECOMMEND_PLAYLIST': 'apiQ/recommend/playlist', // qq 推荐歌单
  'QQ_GET_COOKIE': 'apiQ/user/getCookie', // qq 获取cookie

  'MIGU_SEARCH': 'apiM/search', // 咪咕 搜索
  'MIGU_URL_GET': 'apiM/song/url', // 咪咕 获取图片、播放链接
  'MIGU_LYRIC': 'apiM/lyric', // 咪咕 歌词
  'MIGU_SINGER_DESC': 'apiM/singer/desc', // 歌手详情
  'MIGU_SINGER_SONGS': 'apiM/singer/songs', // 根据歌手获取歌曲
  'MIGU_SINGER_ALBUMS': 'apiM/singer/albums', // 根据歌手获取专辑
  'MIGU_ALBUM': 'apiM/album', // 获取专辑信息
  'MIGU_SONG_INFO': 'apiM/song', // 咪咕 获取歌曲信息
  'MIGU_PLAYLIST': 'apiM/playlist', // 咪咕 歌单
  'MIGU_RECOMMEND_PLAYLIST': 'apiM/recommend/playlist', // 咪咕 推荐歌单

  'COMMON_GET_FEEDBACK': 'apiQ/feedback', // 获取反馈
  'COMMON_ADD_FEEDBACK': 'apiQ/feedback/add', // 增加反馈
  'COMMON_DELETE_FEEDBACK': 'apiQ/feedback/delete', // 删除反馈

  '163': '//music.jsososo.com/neapi/index.php',
  'QQ_SONG_INFO': '//u.y.qq.com/cgi-bin/musicu.fcg',
  'QQ_LIST': '//c.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg',
  'QQ_USER_LIST_DETAIL': '//music.jsososo.com/api/getQQListDetail.php',
  'QQ_GET_LYRIC': '//music.jsososo.com/api/getQQLyricNew.php',
  'QQ_RADIO_INFO': '//u.y.qq.com/cgi-bin/musicu.fcg',
};

export default apiList;