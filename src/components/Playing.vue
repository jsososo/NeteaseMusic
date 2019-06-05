<template>
  <div class="playnow-container">
    <div class="progress-container" v-if="playNow.al && playNow.al.picUrl">
      <el-progress
        :width="280"
        color="#409EFFCC"
        :stroke-width="10"
        type="circle"
        :percentage="percent * 100"
        style="opacity: 0.5;position: absolute;top: 10px;left: 10px;"
        :show-text="false"
      />
      <img :class="`progress-cover playing-${!downloading && playing}`" :src="playNow.al.picUrl" alt="">
    </div>
    <div class="song-info" v-if="playNow.id">
      <div class="info-line">
        <div class="info-label">Song</div>
        <div class="info-val">{{playNow.name}}</div>
      </div>
      <div class="info-line">
        <div class="info-label">Singer</div>
        <div class="info-val">{{playNow.ar}}</div>
      </div>
      <div class="info-line">
        <div class="info-label">Album</div>
        <div class="info-val" v-if="playNow.al && playNow.al.name">{{playNow.al.name}}</div>
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
      })
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
          width: 100px;
          text-align: right;
          opacity: 1;
          letter-spacing: 1px;
        }

        .info-val {
          max-width: calc(100% - 125px);
          display: inline-block;
          vertical-align: top;
          text-shadow: 0 0 0;
          position: absolute;
          left: 125px;
          transition: 0.3s;
          font-weight: bold;
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
          }
        }
      }
    }
  }
</style>