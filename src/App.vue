<template>
  <div id="app">
    <img src="./assets/img/bg-1.png" alt="" class="app-bg">
    <img id="play-music-bg" alt="">
    <div class="main-container">
      <div style="display: inline-block;width: 60%;" v-if="showCover">
        <Playing />
      </div>
      <router-view />
      <PageLeft />
      <Player />
      <Operation />
    </div>
  </div>
</template>

<script>
  import Storage from './assets/utils/Storage';
  import Player from './components/Player';
  import PageLeft from './components/PageLeft';
  import Playing from './components/Playing';
  import Operation from './components/Operation';
  import request, { loginStatus, getQQVkey } from './assets/utils/request';
  import { mapGetters } from 'vuex';

  export default {
    name: 'App',
    components: { Player, PageLeft, Playing, Operation },
    data() {
      return {
        defaultActive: '/',
      }
    },
    computed: {
      ...mapGetters({
        allSongs: 'getAllSongs',
        showCover: 'isShowCoverImg',
      })
    },
    created() {
      window.VUE_APP = this;
      window.QUERY_QQ_TIMES = 1;
      loginStatus();
      getQQVkey();

      // 播放顺序，qq号的一些配置
      if (!Storage.get('orderType')) {
        Storage.set('orderType', 'liebiao');
      }
      this.defaultActive = window.location.hash.split('/')[1];

      Storage.setDefault({
        listen_size: 'size320',
        down_size: 'high',
        down_high: 'sizeflac',
      });

      // 初始化一下下载记录
      const downList = Storage.get('down_list_info', true, '[]');
      downList.forEach((item) => {
        // 一般是之前没有下载完就关掉了页面
        if (item.status !== 'success') {
          item.status = 'abort';
        }
      });
      this.$store.dispatch('updateDownloadList', {
        count: 0,
        list: downList,
      });
    },
    methods: {

    }
  }
</script>

<style lang="scss">
  @import "assets/style/common";
  body {
    overflow: hidden;
  }
  #app {
    height: 100vh;
    min-width: 1200px;

    #play-music-bg {
      position: absolute;
      z-index: 0;
      left: -5vw;
      min-width: 110vw;
      min-height: 110vh;
      bottom: -30%;
      -webkit-filter: blur(50px) brightness(60%);
      -moz-filter: blur(50px) brightness(60%);
      -o-filter: blur(50px) brightness(60%);
      -ms-filter: blur(50px) brightness(60%);
      filter: blur(50px) brightness(60%);
    }

    .app-bg {
      position: relative;
      z-index: -1;
      top: 0;
      left: 0;
      min-width: 100vw;
      min-height: 100vh;
    }

    .main-container {
      position: absolute;
      overflow-y: auto;
      overflow-x: hidden;
      min-width: 1200px;
      height: calc(100vh - 80px);
      top: 0;
      left: 0;
      display: inline-block;
      vertical-align: top;
      padding: 20px 20px 0 20px;
      width: 100%;
      box-sizing: border-box;

      &::-webkit-scrollbar
      {
        width:8px;
        height:8px;
        background-color:rgba(0,0,0,0);
      }
      /*定义滚动条轨道
       内阴影+圆角*/
      &::-webkit-scrollbar-track
      {
        border-radius:10px;
        background-color: rgba(255,255,255,0.1);
      }
      /*定义滑块
       内阴影+圆角*/
      &::-webkit-scrollbar-thumb
      {
        border-radius:10px;
        background-color:rgba(255,255,255,0.5);
      }
    }
  }
</style>
