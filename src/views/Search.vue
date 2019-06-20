<template>
  <div :class="`search-page-container ${show && 'show'}`" @scroll="onScroll">
    <input type="text" class="search-input mt_15" placeholder="Search..." v-model="keywords">
    <div class="ml_10 mt_10 mb_20">
      <div
        v-for="item in typeList"
        :key="`type-${item.val}`"
        @click="search('type', item.val)"
        :class="`search-type ${item.color} ${searchQuery.type === item.val && 'selected'}`"
      >
        <i :class="`iconfont icon-${item.icon}`" />
        {{item.text}}
      </div>
    </div>

    <!-- 歌曲 -->
    <div v-if="searchQuery.type === 1">
      <div class="empty-status" v-if="!searchQuery.songs || searchQuery.songs.length === 0">
        空空如也！
      </div>
      <div class="song-list result-list" v-if="searchQuery.songs && searchQuery.songs.length > 0">
        <div
          :class="`song-item ${(allSongs[s].url || allSongs[s].qqId) ? 'hasurl' : 'disabled'}`"
          v-for="(s, i) in searchQuery.songs"
          :key="`${s}-${i}`"
          @click="playMusic(s)"
        >
          <div class="playing-bg" v-if="playNow.id === s" :style="`width: ${playingPercent * 100}%`">
            <div class="wave-bg"></div>
            <div class="wave-bg2"></div>
          </div>
          <div v-if="playNow.id !== s" class="play-icon-container">
            <span class="play-icon">
            <i class="iconfont icon-play" />
          </span>
          </div>
          <span class="song-order">{{i+1}}</span>
          <div class="song-album-img" :style="`background-image: url('${allSongs[s].al && `${allSongs[s].al.picUrl}?param=50y50`}')`"></div>
          <span class="song-name">{{allSongs[s].name}}</span>
          <span class="artist-name">{{allSongs[s].ar}}</span>
          <span class="operation-btns">
            <i
              v-if="allList[userList.favId]"
              @click="likeMusic(s)"
              :class="`operation-icon operation-icon-1 iconfont icon-${allList[userList.favId].indexOf(s) > -1 ? 'like' : 'unlike'}`"
            />
            <i
              @click="playlistTracks(s, 'add', 'ADD_SONG_2_LIST')"
              class="operation-icon operation-icon-2 iconfont icon-add"
            />
          </span>
          <div
            v-if="allList[userList.favId] && (allList[userList.favId].indexOf(s) > -1)"
            class="liked-item"
          />
        </div>
      </div>
    </div>

    <!-- 专辑 -->
    <div v-if="searchQuery.type === 10">
      <div class="empty-status">
        开发中哟
      </div>
    </div>

    <!-- 歌手 -->
    <div v-if="searchQuery.type === 100">
      <div class="singer-list result-list" v-if="searchQuery.artists && searchQuery.artists.length > 0">
        <div v-for="s in searchQuery.artists" class="singer-item" @click="goTo(`#/singer?id=${s.id}`)">
          <img class="singer-img" :src="`${String(s.picUrl) === 'null' ? 'http://p3.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg' : s.picUrl}?param=120y120`"  />
          <div class="singer-name">{{s.name}}</div>
        </div>
      </div>
      <div class="empty-status" v-if="!searchQuery.artists || searchQuery.artists.length === 0">
        空空如也！
      </div>
    </div>
  </div>
</template>

<script>
  import { searchReq, likeMusic } from "../assets/utils/request";
  import { mapGetters } from 'vuex';
  import $ from 'jquery';

  export default {
    name: "Search",
    data() {
      return {
        show: false,
        keywords: '',
        typeList: [
          {
            val: 1,
            color: 'red',
            icon: 'song',
            text: '歌曲',
          },
          {
            val: 10,
            color: 'blue',
            icon: 'album',
            text: '专辑',
          },
          {
            val: 100,
            color: 'green',
            icon: 'singer',
            text: '歌手',
          },
        ],
        loading: false,
      }
    },
    computed: {
      ...mapGetters({
        searchQuery: 'getSearch',
        allSongs: 'getAllSongs',
        playNow: 'getPlaying',
        playingPercent: 'getPlayingPercent',
        allList: 'getAllList',
        userList: 'getUserList',
      })
    },
    watch: {
      keywords(v) {
        this.search('keywords', v);
      }
    },
    created() {
      setTimeout(() => this.show = true, 1);
    },
    beforeDestroy() {
      this.show = false;
    },
    methods: {
      async search(key, val) {
        const { searchQuery, loading } = this;
        if (loading) {
          return;
        }
        this.loading = true;
        searchQuery.pageNo = 1;
        searchQuery[key] = val;
        await searchReq(searchQuery);
        this.loading = false;
      },
      playMusic(id) {
        const { dispatch } = this.$store;
        const { allSongs, searchQuery } = this;
        const song = allSongs[id];
        if (!song.url) {
          return;
        }
        dispatch('updatePlayNow', song);
        dispatch('updatePlayingList', { list: searchQuery.songs });
        dispatch('updatePlayingStatus', true);
      },
      onScroll() {
        const { searchQuery } = this;
        const { pageNo, total, loading } = searchQuery;
        const el = $('.search-page-container');
        const viewH = el.height(); // 可见高度
        const contentH = el.get(0).scrollHeight; // 内容高度
        const scrollTop = el.scrollTop(); // 滚动高度
        if (contentH - viewH - scrollTop < 150 && pageNo * 30 < total && !loading) {
          this.search('pageNo', pageNo + 1);
        }
      },
      likeMusic: likeMusic,
      playlistTracks(tracks, op, type) {
        window.event.stopPropagation();
        this.$store.dispatch('setOperation', { data: { tracks, op }, type });
      },
      goTo(url) {
        window.location = url;
      }
    }
  }
</script>

<style lang="scss" scoped>
  .search-page-container {
    position: absolute;
    height: calc(100% - 30px);
    width: 550px;
    background: #0003;
    transition: 0.3s;
    right: -200px;
    top: 0;
    transform: rotate(90deg);
    border-radius: 20px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 0;
      height:8px;
      background-color:rgba(0,0,0,0);
    }

    &.show {
      right: 20px;
      top: 20px;
      transform: rotate(0);
    }

    .search-input {
      background: transparent !important;
      border: transparent;
      border-bottom: 1px solid rgba(255,255,255, 0.5) !important;
      color: white;
      font-size: 20px;
      outline: none !important;
      width: 385px;
      vertical-align: -5px;
      margin-left: 20px;

      &::-webkit-input-placeholder {
        color: rgba(255,255,255,0.5);
      }
    }

    .search-type {
      display: inline-block;
      vertical-align: top;
      margin-right: 20px;
      color: #fff8;
      line-height: 20px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      padding-bottom: 2px;
      transition: 0.3s;
      
      &.selected {
        color: #fffc;

        &.red {
          border-bottom: 2px solid #F56C6Ccc;
        }
        &.blue {
          border-bottom: 2px solid #409EFFcc;
        }
        &.green {
          border-bottom: 2px solid #67C23Acc;
        }
      }

      &.red {
        .iconfont {
          color: #F56C6C;
        }
      }
      &.blue {
        .iconfont {
          color: #409EFF;
        }
      }
      &.green {
        .iconfont {
          color: #67C23A;
        }
      }
    }

    .empty-status {
      text-align: center;
      margin-top: 20px;
      font-size: 20px;
      color: #fffc;
      opacity: 0.8;
    }

    .song-list {
      width: calc(100% - 30px);
      margin-left: 10px;

      .song-item {
        border-bottom: 1px solid #fff3;
        color: #fff8;
        transition: 0.3s;
        height: 60px;
        line-height: 60px;
        position: relative;
        overflow: hidden;

        >span, >div {
          vertical-align: top;
        }

        .playing-bg {
          position: absolute;
          height: 76px;
          top: -3px;

          .wave-bg {
            width: 60vw;
            height: 60vw;
            border-radius: 35%;
            position: absolute;
            right: 0;
            top: -30vw;
            animation: waveBg 5s infinite linear;
            background: -webkit-linear-gradient(left, #409EFF33, #409EFF99);
          }
          .wave-bg2 {
            width: 80vw;
            height: 80vw;
            border-radius: 45%;
            position: absolute;
            right: 0;
            top: -40vw;
            animation: waveBg 8s infinite linear;
            background: -webkit-linear-gradient(top, #fff1, #fff2);
          }

          @keyframes waveBg {
            from {
              transform: rotate(0);
            }
            to {
              transform: rotate(360deg);
            }
          }
        }


        &.disabled {
          opacity: 0.4;
        }

        &.hasurl {
          cursor: pointer;

          &:hover {
            background: rgba(255,255,255,0.2);

            .song-album-img {
              background-size: 80px 80px;
              opacity: 0.4;
              filter: blur(2px);
            }

            .song-name {
              font-size: 20px;
              color: #fffc;
              padding-left: -40px;
            }

            .artist-name {
              opacity: 0;
              width: 0;
            }

            .operation-btns {
              opacity: 1;

              .iconfont {
                letter-spacing: 20px;
              }
            }

            .like-bg {
              transform: rotate(-10deg);
              font-size: 160px !important;
            }

            .play-icon-container {
              left: -10px;

              .play-icon {
                border-radius: 0 2000% 2000% 0;
              }
            }
          }
        }

        .song-order {
          display: inline-block;
          width: 40px;
          padding-left: 10px;
        }

        .song-name {
          display: inline-block;
          width: 270px;
          font-size: 16px;
          padding-left: 50px;
          transition: 0.3s;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .song-album-img {
          width: 90px;
          height: 60px;
          position: absolute;
          overflow: hidden;
          left: 30px;
          background-size: 40px 40px;
          display: inline-block;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.8;
          z-index: -1;
          transition: 0.3s
        }

        .artist-name {
          display: inline-block;
          width: 120px;
          vertical-align: top;
          font-size: 14px;
          height: 60px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          opacity: 1;
          transition: 0.3s;
        }

        .operation-btns {
          display: inline-block;
          transition: 0.4s 0.1s;
          opacity: 0;

          .iconfont {
            letter-spacing: 70px;
            transition: 0.3s 0.2s;
          }
        }

        .liked-item {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 1px;
          box-shadow: -5px 0 10px 2px #F56C6C;
        }

        .play-icon-container {
          position: absolute;
          width: 50px;
          left: -70px;
          height: 60px;
          overflow: hidden;
          top: 0;
          z-index: 2;
          display: inline-block;
          transition: 0.3s;

          .play-icon {
            height: 100px;
            width: 50px;
            background: #409EFF;
            transition: 0.3s;
            position: absolute;
            top: -20px;
            border-radius: 0;
          }

          .iconfont {
            color: #fff;
            padding-left: 20px;
            line-height: 100px;
          }
        }
      }
    }

    .singer-list {
      .singer-item {
        position: relative;
        width: 25%;
        box-sizing: border-box;
        display: inline-block;
        vertical-align: top;
        margin-bottom: 20px;
        text-align: center;
        cursor: pointer;
        transition: 0.3s;
        opacity: 0.7;

        &:hover {
          opacity: 1;
        }

        .singer-img {
          width: 60%;
          border-radius: 50%;
          margin-top: 20px;
        }

        .singer-name {
          padding-top: 10px;
          color: #fff8;
        }
      }
    }
  }
</style>