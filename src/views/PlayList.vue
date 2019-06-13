<template>
  <div :class="`playlist-container ${show && 'show'}`">
    <div class="playlist-list">
      <!-- 日推-->
      <div
        v-if="allList.daily && (hash === 'playlist' || hash === 'recommend')"
        class="playlist-item"
        @click="goTo('daily')"
      >
        <div class="list-img" style="border: 1px solid #fff5;text-align: center;">
          {{new Date().getDate()}}
        </div>
        <span class="list-name">每日推荐</span>
        <span class="list-count">{{allList.daily.length}}</span>
      </div>
      <!-- 歌单列表 -->
      <div
        v-if="hash === 'playlist' || hash === 'recommend'"
        class="playlist-item"
        v-for="item in (hash === 'playlist' ? userList.list : recommendList.list)"
        :key="`playlist-${item.id}`"
        @click="goTo(item.id)"
      >
        <img :src="`${item.coverImgUrl}?param=50y50`" class="list-bg-img" />
        <img :src="`${item.coverImgUrl}?param=200y200`" class="list-img" />
        <span class="list-name">{{item.name}}</span>
        <span class="list-count">{{item.trackCount}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    name: "PlayList",
    data() {
      return {
        show: false,
        hash: '',
      };
    },
    computed: {
      ...mapGetters({
        userList: 'getUserList',
        allList: 'getAllList',
        recommendList: 'getRecommendList',
      })
    },
    created() {
      this.hashChange();
      setTimeout(() => {
        this.show = true;
        window.onhashchange = this.hashChange;
      });
    },
    destroyed() {
      this.show = false;
      window.onhashchange = null;
    },
    methods: {
      hashChange() {
        const hashs = ['playlist', 'recommend'];
        this.hash = hashs.find((h) => document.location.hash.indexOf(h) > -1);
      },
      goTo(id) {
        window.location = `#/playlist/detail?id=${id}`;
      }
    }
  }
</script>

<style lang="scss" scoped>
  .playlist-container {
    width: 40%;
    display: inline-block;
    vertical-align: top;
    height: (calc(100% - 40px));
    overflow: auto;
    position: absolute;
    left: 80%;
    opacity: 0;
    transition: 0.5s;

    &.show {
      left: 60%;
      opacity: 1;
    }

    &::-webkit-scrollbar {
      width: 0;
      height:8px;
      background-color:rgba(0,0,0,0);
    }

    .playlist-list {
      background: #0003;
      border-left: 1px solid #fffc;
      padding-left: 20px;

      .playlist-item {
        position: relative;
        height: 80px;
        overflow: hidden;
        padding: 10px;
        opacity: 0.8;
        transition: 0.4s;
        box-shadow: 0 0 0 #0003;

        .list-bg-img {
          position: absolute;
          z-index: 0;
          opacity: 0.2;
          filter: blur(30px);
          width: 200px;
          height: 200px;
          top: -60px;
          transition: 0.3s;
        }
        .list-img {
          border-radius: 3px;
          display: inline-block;
          transition: 0.3s;
          position: absolute;
          transform: rotate(0);
          top: 10px;
          left: 10px;
          width: 70px;
          height: 70px;
          line-height: 70px;
          font-weight: bold;
          color: #fff5;
          font-size: 40px;
        }
        .list-name {
          display: inline-block;
          vertical-align: top;
          font-size: 20px;
          color: #fffc;
          margin-left: 20px;
          transition: 0.3s;
          padding-left: 70px;
        }
        .list-count {
          position: absolute;
          right: 10px;
          font-weight: bold;
          font-size: 44px;
          color: #fff4;
          padding-top: 30px;
          transform: rotate(0);
          transition: 0.3s;
        }

        &:hover {
          opacity: 1;
          box-shadow: 0 4px 20px #0004;

          .list-count {
            transform: rotate(-90deg);
            padding-top: 10px;
          }

          .list-name {
            font-size: 24px;
            padding-left: 85px;
          }
          .list-img {
            transform: rotate(-30deg);
            top: -20px;
            left: -40px;
            width: 120px;
            height: 120px;
            line-height: 120px;
            font-size: 70px;
          }
        }
      }
    }
  }
</style>