# NetEasyMusic
网易云 + QQ音乐 第三方 web端

可以通过访问 http://music.jsososo.com || http://y.jsososo.com 预览。

对于网易云没有版权的歌曲，采用粗暴的用歌名 + 歌手在qq音乐里进行搜索，生成链接。

ps: qq音乐那边是需要登陆vip用户 cookie 才能获取到一些接口的数据，目前是我会不定时的去更新，有什么好的建议也欢迎告诉我或者提 pr，这个项目或者隔壁的[QQMusicApi](https://github.com/jsososo/QQMusicApi)都可。

## 后端

[NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

[QQMusicApi](https://github.com/jsososo/QQMusicApi)


## 前端

项目使用 vue-cli-3 作为脚手架，用vue全家桶搭建，项目由之前的 [qq音乐播放器](https://github.com/jsososo/music-player) 改造而来，只为了一个 **最帅的音乐播放器**

nginx 配置如下
```
#音乐播放器
server {
    listen      80;
    server_name test.163.jsososo.com;
    location /api/ {
        proxy_pass http://39.100.111.202:3000;
        proxy_set_header Host "163.jsososo.com";
    }
    location /apiQ/ {
        proxy_pass http://39.100.111.202:80;
        proxy_set_header Host "163.jsososo.com";
    }
    location / {
        proxy_pass http://localhost:3335;
        proxy_set_header Host "163.jsososo.com";
    }
}
```

## Feature && TODO
- [x] 听歌 （19-6-5）
- [x] 登陆，获取歌单 (19-6-5)
- [x] 搜索歌曲 (19-6-5)
- [x] 获取歌词 (19-6-6)
- [x] 获取评论 (19-6-6)
- [x] 从qq音乐获取网易云没有版权的歌 (19-6-7)
- [x] 评论点赞 (19-6-13)
- [x] 喜欢歌曲 (19-6-13)
- [x] 获取推荐歌单、日推 (19-6-13)
- [x] 歌曲收藏等操作 (19-6-18)
- [x] 歌手详情页 (19-6-19)
- [x] 心动模式 (19-6-20)
- [x] 专辑详情页 (19-6-27)
- [x] 发送、删除评论 (19-6-28)
- [x] 搜索歌单、专辑、歌手 (19-6-28)
- [x] 听歌打卡，计入网易云记录 (19-7-4)
- [x] 键盘监听 (19-7-4)
- [x] 别的用户页、用户页详情 (19-7-13)
- [x] 下载 (19-7-22)
- [x] 动画性能优化 (19-7-24)
- [x] 返回、列表支持筛选播放 (19-7-26)
- [x] 私人FM (19-8-8)
- [x] 搜索歌单 (19-9-9)
- [x] 分享歌曲 (19-9-12)
- [x] 回复评论 (19-9-12)
- [x] 支持QQ音乐的搜索 (19-10-11)
- [x] 支持QQ音乐用户歌单 (19-10-17)
- [x] 极简模式 (19-10-18)
- [x] 支持QQ音乐歌手、歌单、专辑搜索 (19-10-30)
- [x] MV
- [x] 音频图支持 (19-11-29)
- [x] 歌单下载、企鹅高品质音乐下载 (19-12-11)
- [ ] 歌单编辑等操作
- [ ] 电台
