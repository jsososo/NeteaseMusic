<template>
  <div class="simple-container">
    <div class="img-container">
      <img class="song-img" :src="playNow.al.picUrl" alt="">
    </div>
    <div class="song-info" v-if="allSongs[playNow.id]">
      <div class="d-table">
        <div class="d-table-cell">
          <div class="song-name">{{playNow.name}}</div>
          <div class="song-artist"><span v-for="a in allSongs[playNow.id].ar" :key="a.id">{{a.name}} </span></div>

          <div class="song-lyric" v-if="playNow.lyric">
            <div :class="`lyric-item ${lyricKey === item && 'active'}`" :key="`lyric-${item}`" v-if="lyricList[item]" v-for="(item) in [startKey, startKey + 1, startKey + 2]">
              {{lyricList[item].str}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: "Simple",
    data() {
      return {
        lyricKey: 0,
        startKey: 0,
        lyricList: [],
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
      }
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
      }
    }
  }
</script>

<style lang="scss">
  .simple-container {
    height: 60vh;
    width: 100%;
    padding: 0 10%;
    padding-top: calc(30vh - 100px);

    .img-container {
      opacity: 0.7;
      overflow: hidden;
      display: inline-block;
      vertical-align: top;
      border-radius: 20%;
      animation: imgBR 13s infinite;

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

      .d-table {
        display: table;
        width: 100%;
        height: 60vh;
      }
      .d-table-cell {
        display: table-cell;
        vertical-align: middle;
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
  }

</style>