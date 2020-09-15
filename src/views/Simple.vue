<template>
  <div :class="`simple-container ${!showCover && 'hide-cover'}`">
    <div class="img-container">
      <img class="song-img" :src="playNow.al.picUrl" alt="">
    </div>
    <div class="song-info" v-if="allSongs[playNow.aId]">
      <div class="d-table">
        <div class="d-table-cell">
          <div class="song-name">{{playNow.name}}</div>
          <div class="song-artist"><span v-for="a in playNow.ar" :key="a.id">{{a.name}} </span></div>

          <div class="song-lyric" v-if="playNow.lyric">
            <div v-if="playNow.rawTrans && showTrans">
              <div class="lyric-item" v-if="lyricList[startKey+1]">
                {{lyricList[startKey+1].str}}
              </div>
              <div class="lyric-item"> </div>
              <div class="lyric-item" v-if="lyricList[startKey+1]">
                {{lyricList[startKey+1].trans}}
              </div>
            </div>
            <div v-else>
              <div :class="`lyric-item ${lyricKey === item && 'active'}`" :key="`lyric-${item}`" v-if="lyricList[item]" v-for="(item) in [startKey, startKey + 1, startKey + 2]">
                {{lyricList[item].str}}
              </div>
            </div>
          </div>

          <div class="page-right-btn" @click="updateSetting('Trans')">
            <div class="right-btn" v-if="playNow.rawTrans">
              <div class="iconfont icon-trans" style="font-size: 28px;">
                <div class="hide-trans" v-if="!showTrans" />
              </div>
              <div class="txt-btn">翻译</div>
            </div>

            <div class="right-btn" @click="updateSetting('Cover')">
              <div class="iconfont icon-cover">
                <div class="hide-trans" v-if="!showCover" />
              </div>
              <div class="txt-btn">封面</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import Storage from "../assets/utils/Storage";

  export default {
    name: "Simple",
    data() {
      return {
        lyricKey: 0,
        startKey: 0,
        lyricList: [],
        showTrans: Storage.get('SHOW_SIMPLE_TRANS') === '1',
        showCover: Storage.get('SHOW_SIMPLE_COVER') === '1',
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        allSongs: 'getAllSongs',
        percent: 'getPlayingPercent',
      })
    },
    created() {
      const { dispatch } = this.$store;
      dispatch('updateShowCover', false);
      dispatch('updateMode', 'simple');
      this.lyricList = Object.values(this.playNow.lyric || {}) || [];
      this.renderLyric();
    },
    watch: {
      playNow(v) {
        this.lyricKey = 0;
        this.startKey = -1;
        this.lyricList = Object.values(v.lyric || {}) || [];
      },
      percent() {
        this.renderLyric();
      },
    },
    methods: {
      renderLyric() {
        const { playNow } = this;
        const { lyric } = playNow;
        if (!lyric) {
          return;
        }
        const lyricKeys = Object.keys(lyric);
        const current = document.getElementById('m-player').currentTime * 1000;
        const key = lyricKeys.findIndex((k) => (k - 300) >= current);
        let lyricKey = current;
        let startKey = 0;
        switch (key) {
          case (lyricKeys.length - 1):
            lyricKey = lyricKeys.length - 1;
            startKey = lyricKeys.length - 2;
            break;
          case -1:
            lyricKey = lyricKeys.length;
            startKey = lyricKeys.length - 1;
            break;
          case 0:
            lyricKey = 0;
            startKey = 0;
            break;
          default:
            lyricKey = key;
            startKey = lyricKey - 1;
        }

        this.lyricKey = lyricKey - 1;
        this.startKey = startKey - 1;
      },
      updateShowTrans() {
        this.showTrans = !this.showTrans;
        Storage.set('SHOW_LRC_TRANS', Number(this.showTrans));
      },
      updateSetting(key) {
        const kStr = `show${key}`
        this[kStr] = !this[kStr];
        Storage.set(`SHOW_SIMPLE_${key.toUpperCase()}`, Number(this[kStr]));
      },
    }
  }
</script>

<style lang="scss">
  .simple-container {
    height: 60vh;
    width: 100%;
    padding: 0 10%;
    padding-top: calc(30vh - 100px);
    transition: 0.3s;

    &.hide-cover {
      padding-top: calc(30vh - 200px);

      .img-container {
        width: 0;
        opacity: 0;
      }

      .song-info {
        width: calc(80vw - 40px);
      }
    }

    .img-container {
      opacity: 0.7;
      overflow: hidden;
      display: inline-block;
      vertical-align: top;
      border-radius: 20%;
      animation: imgBR 13s infinite;
      transition: 0.3s;
      width: 60vh;

      @keyframes imgBR {
        from, to {
          border-radius: 20%;
          transform: scale(1);
        }
        30%, 80% {
          border-radius: 17%;
          transform: scale(1.01);
        }

        60% {
          border-radius: 21%;
          transform: scale(0.995);
        }

      }

      .song-img {
        height: 60vh;
      }

    }

    .song-info {
      display: inline-block;
      vertical-align: top;
      text-align: center;
      width: calc(60vw - 100px);
      color: #fffa;
      font-weight: bold;
      font-size: 26px;
      line-height: 32px;
      height: 60vh;
      transition: 0.3s;

      .d-table {
        display: table;
        width: 100%;
        height: 60vh;
      }
      .d-table-cell {
        display: table-cell;
        vertical-align: middle;
        position: relative;
      }

      .song-artist {
        font-size: 16px;
        margin-top: 15px;
      }

      .song-lyric {
        font-size: 20px;
        font-weight: normal;
        margin-top: 50px;

        .lyric-item {
          padding: 5px 0;
          opacity: 0.6;

          &.active {
            opacity: 0.9;
          }
        }
      }
    }

    .page-right-btn {
      position: fixed;
      top: calc(50% - 20px);
      transform: translateX(95px);
      right: 0;
      width: 140px;
      background: #fff3;
      opacity: 0.2;
      transition: 0.3s;
      padding-left: 10px;
      box-shadow: 0 0 5px #fff;
      border-radius: 20px;
      box-sizing: border-box;

      .right-btn {
        margin: 10px 0;
        text-align: left;
        cursor: pointer;
      }

      &:hover {
        opacity: 0.4;
        box-shadow: 0 0 10px #fff;
        transform: translateX(50px);
      }

      .txt-btn {
        display: inline-block;
        font-size: 14px;
        line-height: 32px;
        vertical-align: top;
        padding-left: 12px;
      }

      .iconfont {
        font-size: 24px;
        color: #fff;
        cursor: pointer;
        display: inline-block;
        line-height: 28px;
        position: relative;

        .hide-trans {
          position: absolute;
          width: 36px;
          border: 2px solid #fff;
          transform: rotate(45deg);
          top: 12px;
          left: -7px;
          background: #fff;
          border-radius: 3px;
        }

      }
    }
  }

</style>