<template>
  <div :class="`search-page-container ${show && 'show'}`" @scroll="onScroll">
    <input type="text" class="search-input mt_15" placeholder="Search..." v-model="keywords">
    <div class="platform-select">
      <i @click="search('platform', '163')" :class="`iconfont icon-163 ${platform === '163' && 'active'}`" />
      <i @click="search('platform', 'qq')" :class="`iconfont icon-qq ${platform === 'qq' && 'active'}`" />
      <i @click="search('platform', 'migu')" :class="`iconfont icon-migu ${platform === 'migu' && 'active'}`" />
    </div>
    <div class="ml_10 mt_10 mb_20">
      <div
        v-if="platform === '163' || item.hasQQ"
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
          <span class="artist-name">{{allSongs[s].ar.map((a) => a.name).join('/')}}</span>
          <span class="operation-btns">
            <i
              v-show="platform === '163'"
              v-if="allList[userList.favId]"
              @click="likeMusic(s)"
              :class="`operation-icon operation-icon-1 iconfont icon-${allList[userList.favId].indexOf(s) > -1 ? 'like' : 'unlike'}`"
            />
            <i
              v-show="platform === '163'"
              @click="playlistTracks(s, 'add', 'ADD_SONG_2_LIST')"
              class="operation-icon operation-icon-2 iconfont icon-add"
            />
            <i
              @click="download(s)"
              class="operation-icon operation-icon-2 iconfont icon-download"
            />
          </span>
          <div
            v-show="platform === '163'"
            v-if="allList[userList.favId] && (allList[userList.favId].indexOf(s) > -1)"
            class="liked-item"
          />
        </div>
      </div>
    </div>

    <!-- 专辑 -->
    <div v-if="searchQuery.type === 10">
      <div class="album-list result-list" v-if="searchQuery.albums && searchQuery.albums.length > 0">
        <div
          v-for="a in searchQuery.albums" :key="a.id" class="album-item"
        >
          <div class="album-img-container pointer" @click="changeUrlQuery({ id: a.id, mid: a.mid, from: a.from }, '#/album')">
            <img :src="`${a.picUrl}?param=200y200`">
          </div>
          <div class="album-name pointer" @click="goTo(`#/album?id=${a.id}`)">{{a.name}}</div>
        </div>
      </div>
      <div class="empty-status" v-if="!searchQuery.albums || searchQuery.albums.length === 0">
        空空如也！
      </div>
    </div>

    <!-- 歌手 -->
    <div v-if="searchQuery.type === 100">
      <div class="singer-list result-list" v-if="searchQuery.artists && searchQuery.artists.length > 0">
        <div v-for="s in searchQuery.artists" class="singer-item" @click="changeUrlQuery({ id: s.id, mid: s.mid, from: s.from }, '#/singer')">
          <img class="singer-img" :src="`${String(s.picUrl) === 'null' ? 'http://p3.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg' : s.picUrl}?param=120y120`"  />
          <div class="singer-name">{{s.name}}</div>
        </div>
      </div>
      <div class="empty-status" v-if="!searchQuery.artists || searchQuery.artists.length === 0">
        空空如也！
      </div>
    </div>

    <!-- 歌单 -->
    <div v-if="searchQuery.type === 1000">
      <div class="playlist-list result-list" v-if="searchQuery.playlists && searchQuery.playlists.length > 0">
        <div v-for="s in searchQuery.playlists" class="playlist-item" @click="changeUrlQuery({ id: s.id, from: s.from }, '#/playlist/detail')">
          <img class="playlist-img" :src="`${s.coverImgUrl}?param=120y120`"  />
          <div class="playlist-name">{{s.name}}</div>
          <div class="playlist-author">
            <span v-if="s.creator">By: {{s.creator.nickname || s.creator.name}}</span>
            <span class="pl_20"><i class="iconfont icon-yinyue" />: {{numToStr(s.playCount || 0)}}</span>
          </div>
          <div class="playlist-trackcount">{{s.trackCount}}</div>
        </div>
      </div>
      <div class="empty-status" v-if="!searchQuery.playlists || searchQuery.playlists.length === 0">
        空空如也！
      </div>
    </div>
  </div>
</template>

<script>
  import { searchReq, likeMusic, download } from "../assets/utils/request";
  import { numToStr, changeUrlQuery } from "../assets/utils/stringHelper";
  import { mapGetters } from 'vuex';
  import { messageHelp } from "../assets/utils/util";
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
            hasQQ: true,
          },
          {
            val: 10,
            color: 'blue',
            icon: 'album',
            text: '专辑',
            hasQQ: true,
          },
          {
            val: 100,
            color: 'green',
            icon: 'singer',
            text: '歌手',
            hasQQ: true,
          },
          {
            val: 1000,
            color: 'yellow',
            icon: 'playlist',
            text: '歌单',
            hasQQ: true,
          },
        ],
        platform: '163',
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
        const checkKeys = () => {
          setTimeout(() => {
            if (v === this.keywords) {
              this.search('keywords', v);
            }
          }, 500);
        };
        checkKeys();
      }
    },
    created() {
      setTimeout(() => this.show = true, 1);
      this.platform = this.searchQuery.platform;
      this.keywords = this.searchQuery.keywords;
      messageHelp(2);
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
        this.platform = searchQuery.platform;
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
      likeMusic,
      changeUrlQuery,
      playlistTracks(tracks, op, type) {
        window.event.stopPropagation();
        this.$store.dispatch('setOperation', { data: { tracks, op }, type });
      },
      goTo(url) {
        window.location = url;
      },
      download,
      numToStr,
    }
  }
</script>

<style lang="scss" scoped>
  .mode-mobile .search-page-container {
    width: 100vw;
    top: 15vw;
    height: calc(100vh - 30vw);
    left: 0;
    background: none;

    .search-type {
      font-size: 2vw;
    }

    .song-list {
      .song-item {
        height: 15vw;
        position: relative;

        .song-order {
          font-size: 2vw !important;
        }
        .song-album-img {
          width: 10vw !important;
          height: 10vw !important;
          margin-top: 2.5vw;
        }

        .song-name {
          font-size: 2.6vw !important;
          line-height: 10vw;
          transform: translate(9.2vw);
        }
        .artist-name {
          font-size: 1.8vw !important;
          position: absolute;
          top: 8vw;
          left: 25vw;
          letter-spacing: 0;
          opacity: 1;
          line-height: 5vw;
          height: 5vw;
          margin-left: 0;
        }
      }
    }

    .search-input {
      width: 60vw !important;
      font-size: 2.5vh;
    }
  }
  .search-page-container {
    position: absolute;
    height: calc(100% - 30px);
    width: 38%;
    background: #0003;
    transition: 0.3s;
    right: 20px;
    top: 20px;
    transform: rotate(90deg) translate(100%, -20px);
    border-radius: 20px;
    overflow-y: auto;
    
    .platform-select {
      display: inline-block;
      vertical-align: bottom;
      margin-left: 10px;

      .iconfont {
        color: #fff;
        display: inline-block;
        margin: 0 10px;
        opacity: 0.4;

        &.active {
          opacity: 0.8;
        }

        &:before {
          cursor: pointer;
        }
      }
    }

    &::-webkit-scrollbar {
      width: 0;
      height:8px;
      background-color:rgba(0,0,0,0);
    }

    &.show {
      transform: rotate(0) translate(0, 0);
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

      $colorMap: (
        red: #F56C6C,
        blue: #409EFF,
        green: #67C23A,
        yellow: #E6A23C,
        gray: #666
      );
      
      &.selected {
        color: #fffc;

        @each $key,$item in $colorMap {
          &.#{$key} {
            border-bottom: 2px solid #{$item}cc;
          }
        }
      }

      @each $key,$item in $colorMap {
        &.#{$key} .iconfont {
          color: $item;
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
              color: #fffc;
              transform: scale(1.25) translate(0);
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
          width: 240px;
          font-size: 16px;
          transform: scale(1) translate(50px);
          transform-origin: left;
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
          margin-left: 70px;
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

    .album-list {
      .album-item {
        display: inline-block;
        width: 50%;
        box-sizing: border-box;
        text-align: center;
        margin: 20px 0;
        transition: 0.3s;
        opacity: 0.7;
        box-shadow: 0 0 0 transparent;
        color: #fffc;

        &:hover {
          opacity: 0.9;

          .album-img-container {
            border-radius: 20px;
            box-shadow: 0 0 30px #333333;

            img {
              width: 170px;
              height: 170px;
              top: -10px;
              left: -10px;
            }
          }
        }

        .album-img-container {
          display: inline-block;
          width: 150px;
          height: 150px;
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          transition: 0.4s;

          img {
            width: 150px;
            height: 150px;
            left: 0;
            top: 0;
            position: absolute;
            transition: 0.3s linear;
          }
        }
        .album-name {
          margin-top: 5px;
          padding: 0 20px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          box-sizing: border-box;
        }
      }
    }

    .playlist-list {
      padding: 0 10px;

      .playlist-item {
        color: #fff9;
        border-bottom: 1px solid #fff6;
        padding: 15px 20px;
        height: 70px;
        opacity: 0.7;
        transition: 0.3s;
        cursor: pointer;
        background: transparent;
        position: relative;
        overflow: hidden;

        &:hover {
          opacity: 1;
          background: #fff1;

          .playlist-name {
            transform: translate(120px) scale(1.1);
          }
          .playlist-author {
            transform: translate(100px, 20px);
          }
          .playlist-img {
            border-radius: 10px;
            transform: scale(1.1);
          }
          .playlist-trackcount {
            transform: rotate(-90deg) translate(15px, 150%);
          }
        }

        .playlist-name {
          display: inline-block;
          width: 100%;
          vertical-align: top;
          transform: translate(90px) scale(1);
          font-weight: bold;
          transition: 0.3s;
          white-space: nowrap;
        }
        .playlist-author {
          width: 100%;
          transform: translate(110px, 20px) scale(1);
          font-size: 12px;
          transition: 0.3s;
        }
        .playlist-img {
          width: 70px;
          border-radius: 20px;
          position: absolute;
          transform: scale(1);
          transition: 0.3s;
        }
        .playlist-trackcount {
          position: absolute;
          right: 10px;
          font-weight: bold;
          font-size: 44px;
          width: 80px;
          text-align: right;
          color: #fff4;
          transform: rotate(0) translate(0, -20px);
          transform-origin: bottom left;
          transition: 0.3s;
        }
      }
    }
  }
</style>