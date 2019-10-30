<template>
  <div :class="`lyric-content-container ${show && 'show'}`">
    <div
      :class="`lyric-list-container ${grab ? 'grabbing' : ''}`"
      @mousedown="changeGrab(true)"
      @mouseup="changeGrab(false)"
      @mouseleave="changeGrab(false)"
      @mousemove="moveLyric"
    >
      <div v-if="playNow.lyric" class="lyric-list" :style="`top: ${top}px;`">
        <div v-for="(item, index) in playNow.lyric" :class="`lyric-item lyric-item-${index} ${index === lyricIndex ? 'lyric-item-now' : ''}`">
          <div v-html="item.str || ''"></div>
          <div v-if="item.trans" v-html="item.trans"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    name: "Lyric",
    data() {
      return {
        lyricIndex: 0,
        top: 600,
        grab: false,
        mouseY: 0,
        mouseTop: 0,
        mouseMove: 0,
        protect: 0, // 保护期，滚完之后给一个保护期，不过这个保护期就不自动滚动歌词
        show: false,
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        percent: 'getPlayingPercent',
      })
    },
    watch: {
      playNow({ lyricKeys = []}) {
        this.protect = 0;
        this.top = document.getElementsByClassName('lyric-content-container')[0].clientHeight / 2 - 35;
        this.mouseTop = 0;
        this.grab = false;
        this.lyricIndex = lyricKeys[0];
        this.mouseY = 0;
      },
      percent() {
        const { playNow } = this;
        const { lyric } = playNow;
        if (!lyric) {
          return;
        }
        const lyricKeys = Object.keys(lyric);
        const current = document.getElementById('m-player').currentTime * 1000;
        const carouselHeight = document.getElementsByClassName('lyric-content-container')[0].clientHeight;
        const key = lyricKeys.findIndex((k) => (k - 300) >= current);
        const nowDom = document.getElementsByClassName('lyric-item-now');
        let lyricKey = current;
        switch (key) {
          case -1:
            lyricKey = lyricKeys[lyricKeys.length - 1] || current;
            break;
          case 0:
            lyricKey = lyricKeys[0];
            break;
          default:
            lyricKey = lyricKeys[key-1];
        }
        this.lyricIndex = lyricKey;

        if (this.protect && (this.protect >= (current - 3000))) {
          return;
        }
        this.protect = 0;
        if (nowDom && nowDom[0] && !this.grab) {
          this.top = carouselHeight / 2 - nowDom[0].offsetTop - 35;
        }
      },
    },
    created() {
      setTimeout(() => this.show = true);
    },
    methods: {
      // 鼠标时点击还是抬起
      changeGrab(v) {
        if (this.grab === v) {
          return;
        }
        this.grab = v;
        const event = window.event;
        const mouseY = event.clientY;
        // 点下的情况
        if (this.grab) {
          this.mouseY = mouseY;
          this.mouseTop = this.top;
        } else {
          //  松开或者鼠标已经移出去
          this.top += this.mouseMove;
          this.mouseMove = 0;
          this.protect = document.getElementById('m-player').currentTime * 1000;
        }
      },

      // 移动歌词
      moveLyric(e) {
        if (this.grab) {
          const event = e || window.event;
          const mouseY = event.clientY;
          this.top = this.mouseTop + mouseY - this.mouseY;
        }
      }
    }
  }
</script>

<style lang="scss">
  .mode-mobile .lyric-content-container {
    width: 100vw !important;
    height: calc(100vh - 30vw) !important;
    left: 0 !important;
    top: 15vh !important;

    .lyric-list {
      width: calc(100vh - 30vw) !important;

      .lyric-item {
        font-size: 3.5vw !important;
        padding: 0.5vw !important;
        min-height: 0 !important;

        &.lyric-item-now {
          font-size: 4vw !important;
        }
      }
    }
  }

  .lyric-content-container {
    height: calc(100% - 50px);
    overflow: hidden;
    position: absolute;
    left: 60%;
    width: 40%;
    opacity: 0;
    transition: 1s;

    &.show {
      opacity: 1;
    }

    .lyric-list-container {
      cursor: grab;

      &.grabbing {
        cursor: grabbing;

        .lyric-list {
          transition: 0s !important;
        }
      }

      .lyric-list {
        height: calc(100vh - 200px);
        position: absolute;
        width: 100%;
        transition: 0.3s top;
      }
      .lyric-item {
        color: rgba(255,255,255,0.5);
        text-align: center;
        font-size: 18px;
        padding: 10px 0;
        transition: 0.5s;
        min-height: 15px;
        line-height: 30px;

        &.lyric-item-now {
          color: rgba(255,255,255,0.8);
          font-size: 22px;
        }
      }
    }
  }
</style>