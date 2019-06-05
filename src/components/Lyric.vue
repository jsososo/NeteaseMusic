<template>
  <div
    :class="`lyric-list-container ${grab ? 'grabbing' : ''}`"
    @mousedown="changeGrab(true)"
    @mouseup="changeGrab(false)"
    @mouseleave="changeGrab(false)"
    @mousemove="moveLyric"
  >
    <div v-if="playNow.lyric" class="lyric-list" :style="`top: ${top}px;`">
      <div v-for="(item, index) in playNow.lyric" :class="`lyric-item lyric-item-${index} ${index === lyricIndex ? 'item-now' : ''}`">
        <div>{{item.str || ''}}</div>
        <div v-if="playNow.lyricTrans && playNow.lyricTrans[index] && playNow.lyricTrans[index].str !== '//'">
          {{playNow.lyricTrans[index].str}}
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
        top: 0,
        grab: false,
        mouseY: 0,
        mouseTop: 0,
        mouseMove: 0,
        protect: 0, // 保护期，滚完之后给一个保护期，不过这个保护期就不滚动歌词
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        playerInfo: 'getPlayerInfo',
      })
    },
    watch: {
      playNow() {
        this.protect = 0;
        this.top = 0;
        this.mouseTop = 0;
        this.grab = false;
        this.lyricIndex = 0;
        this.mouseY = 0;
      },
      playerInfo(v) {
        const lyric = this.playNow.lyric || [];
        const current = Math.round(v.current * 100);
        const carouselHeight = document.getElementsByClassName('el-carousel__item')[0].clientHeight;
        if (lyric.length) {
          let index = lyric.findIndex((item) => item.time > current) - 1;
          if (current >= lyric[lyric.length - 1].time) {
            index = lyric.length - 1;
          }
          if (this.protect && (this.protect >= (current / 100 - 3))) {
            return;
          }
          this.protect = 0;
          this.lyricIndex = index;
          const nowDom = document.getElementsByClassName('item-now');
          if (nowDom && nowDom[0] && !this.grab) {
            this.top = carouselHeight / 2 - nowDom[0].offsetTop - 35;
          }
        }
      },
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
          this.protect = this.playerInfo.current;
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

      &.item-now {
        color: rgba(255,255,255,0.8);
        font-size: 22px;
        font-weight: bold;
      }
    }
  }
</style>