<template>
  <div class="about-page">
    <div class="content-block ">
      <h2>一起听音乐呀 <a href="https://github.com/jsososo/NeteaseMusic" class="ml_20" target="_blank"><i class="iconfont icon-git" style="font-size: 24px;" /></a></h2>
      <div class="mt_20">
        <p>
          如果有什么想说的！请戳👉 <a class="pl_5" href="#/feedback" >反馈<i class="iconfont pl_10 icon-feedback"></i></a>
        </p>
        <p>
          项目使用 vue-cli-3 作为脚手架，用vue全家桶搭建，项目由之前的 <a href="https://github.com/jsososo/music-player" target="_blank">qq音乐播放器</a> 改造而来，
          仅兼容最新版 Chrome
        </p>
        <p>
          所有的数据内容均来自网易云音乐，本网站不做数据存储处理等信息，所有的配置信息均存在本地
        </p>
        <p>
          关于那些 vip 歌曲和 网易云 没有版权的歌曲，在这里当然都是能听的啦，实现方法为根据歌名 + 歌手 调用 qq 音乐接口进行搜索，
          所以可能存在搜索出来的歌曲和世纪显示的歌曲不匹配的情况，欢迎在这里进行评论，我会尽快修复 <a href="https://github.com/jsososo/NeteaseMusic/issues/1" target="_blank">#ISSUE1</a>
        </p>
        <p>
          音频图于 19-11-29 支持，会更消耗性能和流量，嫌弃可以关闭！另外由于读取音频所以数据相当于完整的播放一次音乐，
          因此如果拖动进度条可能导致无法获取到音频数据，如果读取音频数据的方法卡了，比当前播放的速度要慢，也可能会出现没有数据。
          同时，因为音频图读取最初数据时需要一两秒的时间，所以切歌时会有短暂的停顿。
        </p>
        <p>
          设置页可以选择输入自己的 qq 音乐 Cookie 获取更多的一些操作，可以借助这个 Chrome 插件
          <a href="https://github.com/jsososo/qqmusic-cookie-porter" target="_blank">qqmusic-cookie-porter</a>
          实现半自动化的获取 Cookie，模拟用户登陆
        </p>
        <p class="mt_20">GitHub: <a href="https://github.com/jsososo/NeteaseMusic" target="_blank">网易云第三方 Web 播放器</a></p>
        <p>后端：「网易云」<a href="https://github.com/Binaryify/NeteaseCloudMusicApi" target="_blank">NeteaseCloudMusicApi</a></p>
        <p>后端：「QQ音乐」<a href="https://github.com/jsososo/QQMusicApi" target="_blank">QQMusicApi</a> (也是我的项目，也欢迎支持一下)</p>
        <p>后端：「咪咕音乐」<a href="https://github.com/jsososo/MiguMusicApi" target="_blank">MiguMusicApi</a> (还是我的项目，也欢迎支持一下)</p>
        <p>后端：「聚合接口」<a href="https://github.com/jsososo/MixMusicApi" target="_blank">MixMusicApi</a>（我的项目也太多了）</p>
        <p>Chrome插件：「QQ音乐Cookie搬运工」<a href="https://github.com/jsososo/qqmusic-cookie-porter" target="_blank">qqmusic-cookie-porter</a>  (又是我的项目，也欢迎支持一下)</p>
      </div>
    </div>

    <div class="content-block">
      <h2>关于网易云无版权音乐</h2>
      <p>
        原先（19-10-11之前）从企鹅音乐获取音乐播放链接的方法被企鹅 ban 了，换了一种方法，目前ok，但是有一个条件，
        如果需要仅 vip 可听的歌曲，那是需要 企鹅vip 的登录账号 Cookie 的，当然，我会在服务器上不定期的更新我自己的 Cookie 【所以大家还是要支持正版，这里只是为了方便和学习呀】
      </p>
    </div>

    <div class="content-block">
      <h2>版本迭代</h2>

      <ul class="mt_20">
        <li v-for="(r) in [...history].reverse()" :key="r.txt" class="mb_15 ml_20">
          <div>{{r.txt}}</div>
          <div class="ml_20"> {{r.time}}</div>
        </li>
      </ul>
    </div>
    
    <div class="content-block qr-block">
      <h2>服务器香油钱</h2>
      <div class="mt_20">
        <img class="pay-img" src="../assets/img/pay-1.png" alt="" />
        <img class="pay-img" src="../assets/img/pay-2.jpeg" alt="" />
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "About",
    data() {
      return {
        history: [
          {
            txt: '🎧 听歌',
            time: '19-6-5',
          },
          {
            txt: '🦌 登录，获取歌单',
            time: '19-6-5',
            icon: ''
          },
          {
            txt: '🔍 搜索歌曲',
            time: '19-6-5',
          },
          {
            txt: '📖 获取歌词',
            time: '19-6-5',
          },
          {
            txt: '😐 获取评论',
            time: '19-6-6',
          },
          {
            txt: '🐧 从qq音乐获取网易云没有版权的歌',
            time: '19-6-7',
          },
          {
            txt: '😍 评论点赞、喜欢歌曲',
            time: '19-6-13',
          },
          {
            txt: '🐰 获取推荐歌曲、日推',
            time: '19-6-13',
          },
          {
            txt: '🏮 歌曲收藏等操作',
            time: '19-6-19',
          },
          {
            txt: '👩‍🎤 歌手详情页',
            time: '19-6-19',
          },
          {
            txt: '💓 心动模式',
            time: '19-6-20',
          },
          {
            txt: '💽 专辑详情页',
            time: '19-6-27',
          },
          {
            txt: '🐱 发送、删除评论',
            time: '19-6-28',
          },
          {
            txt: '🍵 搜索专辑、歌手',
            time: '19-6-28',
          },
          {
            txt: '📝 听歌打卡，计入网易云记录',
            time: '19-7-4',
          },
          {
            txt: '⌨️ 键盘监听',
            time: '19-7-8',
          },
          {
            txt: '🍒 听歌历史排行，关于',
            time: '19-7-12',
          },
          {
            txt: '👧 其他用户详情页、粉丝、关注列表',
            time: '19-7-13',
          },
          {
            txt: '📁 下载',
            time: '19-7-22',
          },
          {
            txt: '💥 动画性能优化，更多下载按钮',
            time: '19-7-24',
          },
          {
            txt: '🔙 新增返回，歌单支持筛选播放',
            time: '19-7-26',
          },
          {
            txt: '🐯 私人FM',
            time: '19-8-8',
          },
          {
            txt: '🐄 一些可能能看见的优化',
            time: '19-9-6',
          },
          {
            txt: '🐷 搜索歌单',
            time: '19-9-9',
          },
          {
            txt: '🎸 分享歌曲',
            time: '19-9-12',
          },
          {
            txt: '🔥 回复评论',
            time: '19-9-12',
          },
          {
            txt: '🤯 支持 QQ 音乐的搜索',
            time: '19-10-11',
          },
          {
            txt: '😫 QQ 音乐禁止 vip 音乐播放',
            time: '19-10-11',
          },
          {
            txt: '😌 QQ 音乐我又回来啦！',
            time: '19-10-14',
          },
          {
            txt: '🐘 QQ 音乐歌单支持',
            time: '19-10-17',
          },
          {
            txt: '🦁️ 极简模式',
            time: '19-10-18',
          },
          {
            txt: '🥛 qq 音乐歌手、专辑页、分享',
            time: '19-10-22',
          },
          {
            txt: '🍙 qq 音乐歌手、专辑、歌单搜索',
            time: '19-10-29',
          },
          {
            txt: '🎬 MV',
            time: '19-10-30',
          },
          {
            txt: '🐙 看见音乐！',
            time: '19-11-29',
          },
          {
            txt: '🍣 歌单下载、企鹅高品质音乐下载',
            time: '19-12-11',
          },
          {
            txt: '🍜 咪咕！',
            time: '19-12-20',
          },
          {
            txt: '💣 正在播放、更多的推荐歌单',
            time: '20-01-07',
          },
          {
            txt: '🕶️ 反馈、音频图延迟优化',
            time: '20-01-09',
          },
          {
            txt: '👿 更多音频图、和一些可能看不见的优化',
            time: '20-01-17',
          },
          {
            txt: '🍶 企鹅部分歌曲下载失败问题',
            time: '20-01-19',
          },
          {
            txt: '🌈 播放支持品质选择、一些优化',
            time: '20-01-26',
          },
          {
            txt:'🐚 加入圈圈、海螺音频图，搜索增加防抖',
            time: '20-01-29',
          },
          {
            txt: '🐑 配合 chrome 插件自动获取存储 cookie',
            time: '20-01-31',
          },
          {
            txt: '⛰️ 企鹅音乐支持收藏歌曲等操作',
            time: '20-02-02',
          },
          {
            txt: '🤤 企鹅音乐评论、点赞 & 咪咕歌单无法显示',
            time: '20-02-16',
          },
          {
            txt: '🦋 单曲列表播放、随机播放排序优化、上一首有时会跳两首优化',
            time: '20-02-21',
          },
          {
            txt: '🐜 歌词定位播放、歌单播放定位、批量下载增加放封延时',
            time: '20-03-04',
          },
          {
            txt: '🦊 FireFox 兼容性问题',
            time: '20-03-12',
          },
          {
            txt: '🍃 去除 cookie 中 uin 的其他字母',
            time: '20-03-22',
          },
          {
            txt: '🌸 mp3 下载支持封面（flac也太难了吧！',
            time: '20-03-23',
          },
          {
            txt: '🍧 mp3下砸支持更多id3标签、歌单收藏操作',
            time: '20-04-04',
          },
          {
            txt: '😉 咪咕搜索部分音乐无法播放',
            time: '20-04-12',
          },
          {
            txt: '🎢 数据层重制、接口整合 ',
            time: '20-05-17',
          },
          {
            txt: '🎰 偷偷修复一些bug',
            time: '20-05-19',
          },
          {
            txt: '🍬 修复咪咕音乐接口问题',
            time: '20-05-26',
          },
          {
            txt: '⛱️ fix 网易云登陆串号并增加退出按钮',
            time: '20-06-07',
          },
          {
            txt: '🐼 缝缝补补一些bug',
            time: '20-06-12',
          },
          {
            txt: '🚒 网易云下载问题 & 音频图大优化！windows 也不卡了！',
            time: '20-06-16',
          },
          {
            txt: '😺 一些杂七杂八的优化',
            time: '20-07-07',
          },
          {
            txt: '🤔 下载歌词 & 支持下载歌名格式修改',
            time: '20-08-02',
          },
          {
            txt: '🥰 会员 & 无版权歌曲替换',
            time: '20-08-15',
          },
          {
            txt: '🦷 下载翻译 & 极简翻译 & id3标签 & fix 下载bug 歌单操作bug',
            time: '20-08-23',
          },
          {
            txt: '🚛 心动模式回归 & chrome 播放控件支持',
            time: '20-08-30',
          },
          {
            txt: '🐤 播放列表逻辑调整，支持加入正在播放 & 倍速 & 极简模式支持隐藏专辑封面',
            time: '20-09-15',
          }
        ],
      }
    },
    created() {
      this.$store.dispatch('updateShowCover', false);
    },
  }
</script>

<style lang="scss" scoped>
  .about-page {
    color: #fffc;
    padding-top: 20px;
    padding-left: 120px;
    width: 60%;
    padding-right: 40%;
    max-height: calc(100vh - 120px);
    overflow: auto;
    position: relative;

    .qr-block {
      width: 35%;
      position: absolute;
      top: 60px;
      right: 10px;
    }

    .content-block {
      margin-bottom: 40px;
    }

    .el-timeline-item__wrapper {
      color: #fffc !important;
      background: blue;
    }
    .el-timeline-item__timestamp {
      color: #fffc;
    }

    p {
      line-height: 24px;
      margin-top: 10px;
    }

    a {
      text-decoration: #fff underline;
      color: #fffc;
    }

    .pay-img {
      width: 200px;
      margin-right: 30px;
    }
  }
</style>