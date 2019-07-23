<template>
  <div class="about-page">
    <div class="content-block ">
      <h2>一起听音乐呀 <a href="https://github.com/jsososo/NeteaseMusic" class="ml_20" target="_blank"><i class="iconfont icon-git" style="font-size: 24px;" /></a></h2>
      <div class="mt_20">
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
        <p class="mt_20">GitHub: <a href="https://github.com/jsososo/NeteaseMusic" target="_blank">网易云第三方 Web 播放器</a></p>
        <p>后端：<a href="https://github.com/Binaryify/NeteaseCloudMusicApi" target="_blank">NeteaseCloudMusicApi</a></p>
      </div>
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

    <div class="content-block">
      <h2>未来</h2>
      <div class="mt_20 ml_20">
        <ul>
          <li v-for="f in future" class="mb_15" :key="f">{{f}}</li>
        </ul>
      </div>
    </div>
    
    <div class="content-block">
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
            txt: '🦌 登陆，获取歌单',
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
        ],
        future: [
          '歌单编辑',
          '下载',
          '极简模式',
          '电台播放',
        ]
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