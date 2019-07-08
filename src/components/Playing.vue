<template>
  <div class="playnow-container" v-if="playNow.id && allSongs[playNow.id]">
    <div class="progress-container" v-if="playNow.al && playNow.al.picUrl">
      <el-progress
        :width="280"
        color="#409EFFCC"
        :stroke-width="10"
        type="circle"
        :percentage="(percent || 0) * 100"
        style="opacity: 0.5;position: absolute;top: 10px;left: 10px;"
        :show-text="false"
      />
      <img :class="`progress-cover playing-${!downloading && playing}`" :src="`${playNow.al.picUrl}?param=300y300`" alt="">
    </div>
    <div class="song-info">
      <div class="info-line">
        <div class="info-label"><i class="iconfont icon-song" /></div>
        <div class="info-val">
          {{playNow.name}}
          <span class="info-br" v-if="playNow.br">{{parseInt(playNow.br / 1000)}}k</span>
        </div>
      </div>
      <div class="info-line">
        <div class="info-label"><i class="iconfont icon-singer" /></div>
        <div class="info-val">
          <a v-for="a in allSongs[playNow.id].ar" :key="a.id" :href="`#/singer?id=${a.id}`">{{a.name}} </a>
        </div>
      </div>
      <div class="info-line">
        <div class="info-label"><i class="iconfont icon-album" /></div>
        <div class="info-val" v-if="playNow.al && playNow.al.name">
          <a :href="`#/album?id=${playNow.al.id}`">{{playNow.al.name}}</a>
        </div>
      </div>

      <div class="btn-group">
        <a class="btn-group-href" href="#/"><i class="iconfont icon-lyric"></i></a>
        <a class="btn-group-href" href="#/comment">
          <i class="iconfont icon-comment"></i>
          <span class="pl_10 ft_12" v-if="playNow.comments">{{numberHandle(playNow.comments.total)}}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    name: "Playing",
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        percent: 'getPlayingPercent',
        downloading: 'isDownloading',
        playing: 'isPlaying',
        allSongs: 'getAllSongs',
      })
    },
    methods: {
      numberHandle(n) {
        return n > 1000 ? `${Number(n / 1000).toFixed(1)}k` : n
      },
      goTo(type) {
        switch (type) {
          case 'singer':
            if (this.playNow.arId.indexOf(',') > 0) {
              return;
            } else {
              return window.location = `#/singer?id=${this.playNow.arId}`;
            }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .playnow-container {
    position: relative;
    .progress-container {
      position: absolute;
      top: 40px;
      left: 120px;

      .progress-cover {
        position: absolute;
        top: 20px;
        left: 20px;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        animation: cdRotate 30s infinite linear;

        &.playing-true {
          animation-play-state: running;
        }
        &.playing-false {
          animation-play-state: paused;
        }

        @keyframes cdRotate {
          from {
            -webkit-transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      }
    }

    .song-info {
      position: absolute;
      top: 350px;
      left: 140px;
      width: calc(100% - 150px);
      max-width: 500px;
      color: #fffa;
      font-size: 20px;
      cursor: default;

      .info-line {
        min-height: 46px;
        opacity: 0.6;
        transition: 0.3s;
        position: relative;
        line-height: 24px;

        .info-label {
          display: inline-block;
          vertical-align: top;
          font-weight: bold;
          text-shadow: 0 0 0;
          transition: 0.3s;
          width: 50px;
          text-align: right;
          opacity: 1;
          letter-spacing: 1px;
        }

        .info-val {
          max-width: calc(100% - 75px);
          display: inline-block;
          vertical-align: top;
          text-shadow: 0 0 0;
          position: absolute;
          left: 75px;
          transition: 0.3s;
          font-weight: bold;

          .info-br {
            font-size: 12px;
            border: 1px solid #fff8;
            font-weight: normal;
            padding: 0 3px;
            margin-left: 10px;
          }
        }

        &:hover {
          opacity: 1;

          .info-label {
            font-size: 24px;
            letter-spacing: 3px;
            opacity: 0.8;
          }

          .info-val {
            text-shadow: 0 0 1px #fff9;
            text-decoration: underline;

            .info-br {
              text-decoration: none !important;
            }
          }
        }
      }

      .btn-group {
        height: 32px;
        padding-left: 75px;

        .btn-group-href {
          color: #fff8;
          transition: 0.3s;
          line-height: 32px;
          height: 32px;
          display: inline-block;
          margin-right: 15px;
          min-width: 30px;

          .iconfont {
            font-size: 18px;
            transition: 0.3s;
            font-weight: bold;
          }

          &:hover .iconfont {
            font-size: 22px;
            color: #fff;
          }
        }
      }
    }
  }
</style>