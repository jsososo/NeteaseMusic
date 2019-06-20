<template>
  <div class="list-detail-container">
    <div v-if="listInfo" class="list-info-detail">
      <div>
        <img class="list-info-cover" :src="`${listInfo.coverImgUrl}?param=100y100`">
        <div class="list-info-txt">
          <div class="list-info-name">{{listInfo.name}}</div>
          <div class="list-info-creator" v-if="listInfo.creator">
            By <span class="creator-name">{{listInfo.creator.nickname}}</span>
          </div>
        </div>
      </div>
      <div>
        <input v-model="search" class="search-input" type="text" placeholder="找呀找呀找歌曲">
      </div>
    </div>
    <div class="song-list" v-if="allList[id]">
      <div
        :class="`song-item ${playNow.id === s && 'played'} ${!allSongs[s].url && 'disabled'}`"
        v-for="(s, i) in list"
        :key="`${s}-${i}`"
        @click="playMusic(s)"
      >
        <div class="playing-bg" v-if="playNow.id === s" :style="`width: ${playingPercent * 100}%`">
          <div class="wave-bg"></div>
          <div class="wave-bg2"></div>
        </div>
        <span class="song-order">{{i+1}}</span>
        <img class="song-cover" :src="`${allSongs[s].al.picUrl}?param=50y50`" alt="">
        <span class="song-name">{{allSongs[s].name}}</span>
        <span class="song-artist">{{allSongs[s].ar.map((a) => a.name).join('/')}}</span>
        <i
          v-if="allList[userList.favId] && (id != userList.favId)"
          @click="likeMusic(s)"
          :class="`operation-icon operation-icon-1 iconfont icon-${allList[userList.favId].indexOf(s) > -1 ? 'like' : 'unlike'}`"
        />
        <i
          @click="playlistTracks(s, id, 'add', 'ADD_SONG_2_LIST')"
          class="operation-icon operation-icon-2 iconfont icon-add"
        />
        <i
          @click="playlistTracks(s, id, 'del', 'DEL_SONG')"
          v-if="userList.obj && userList.obj[id] && !userList.obj[id].subscribed && (id !== userList.favId)"
          class="operation-icon operation-icon-3 iconfont icon-delete"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import { getQueryFromUrl } from "../assets/utils/stringHelper";
  import { getPlayList, likeMusic } from "../assets/utils/request";
  import { mapGetters } from 'vuex';

  export default {
    name: "PlayListDetail",
    data() {
      return {
        id: getQueryFromUrl('id'),
        search: '',
        list: [],
        listInfo: null,
      }
    },
    computed: {
      ...mapGetters({
        userList: 'getUserList',
        allList: 'getAllList',
        allSongs: 'getAllSongs',
        playNow: 'getPlaying',
        playingPercent: 'getPlayingPercent',
      })
    },
    watch: {
      allList() {
        this.searchList();
      },
      search() {
        this.searchList();
      },
      $route(){
        this.id = this.$route.query.id;
        this.init();
      }
    },
    created() {
      this.list = this.allList[this.id] || [];
      this.listInfo = (this.userList && this.userList.obj && this.userList.obj[this.id]) || null;
      this.init();
    },
    methods: {
      init() {
        if (this.id === 'daily') {
          return this.list = this.allList.daily || [];
        }
        getPlayList(this.id)
          .then(({ playlist }) => {
            const { name, creator, coverImgUrl, playCount } = playlist;
            this.listInfo = { name, creator, coverImgUrl, playCount };
          })
      },
      playMusic(id) {
        const { allSongs, allList } = this;
        const { dispatch } = this.$store;
        const song = allSongs[id];
        if (!song.url) {
          return;
        }
        dispatch('updatePlayNow', song);
        dispatch('updatePlayingList', { list: allList[this.id], id: this.id });
        dispatch('updatePlayingStatus', true);
      },
      searchList() {
        const { search, allList, id, allSongs } = this;
        const rex = search.replace(/\/|\s|\t|,|，|-|/g, '').toLowerCase();
        if (!rex) {
          return this.list = allList[id];
        }
        this.list = (allList[id] || []).filter((s) => (
          `${allSongs[s].name}
          ${allSongs[s].ar.map((a) => a.name)}
          ${allSongs[s].al.name}
          ${allSongs[s].name}
          ${allSongs[s].al.name}
          ${allSongs[s].ar.map((a) => a.name)}
          ${allSongs[s].name}`
            .replace(/\s/g, '')
            .toLowerCase()
            .indexOf(rex) > -1
        ));
      },
      likeMusic: likeMusic,
      playlistTracks(tracks, pid, op, type) {
        window.event.stopPropagation();
        this.$store.dispatch('setOperation', { data: { tracks, pid, op }, type });
      },
    }
  }
</script>

<style lang="scss" scoped>
  .list-detail-container {
    width: 40%;
    position: absolute;
    right: 0;
    height: calc(100% - 20px);
    top: 20px;
    overflow-y: auto;
    background: #0001;
    border-left: 1px solid #fff5;

    &::-webkit-scrollbar {
      width: 0;
      height:8px;
      background-color:rgba(0,0,0,0);
    }

    .list-info-detail {
      padding: 15px 15px 0 15px;
      color: #fff9;
      background: #0003;
      box-shadow: 0 2px 10px #0005;
      margin-bottom: 10px;

      .list-info-cover {
        border-radius: 20px;
        opacity: 0.6;
        display: inline-block;
        vertical-align: top;
      }

      .list-info-txt {
        display: inline-block;
        width: calc(100% - 140px);
        vertical-align: top;
        padding-left: 30px;

        .list-info-name {
          font-size: 24px;
          font-weight: bold;
        }

        .list-info-creator {
          margin-top: 5px;
          opacity: 0.8;
          transition: 0.3s;
          cursor: pointer;

          &:hover {
            opacity: 1;

            .creator-name {
              text-decoration: underline;
            }
          }
        }
      }

      .search-input {
        margin-top: 15px;
        background: transparent;
        border: transparent;
        color: white;
        padding-bottom: 10px;
        font-size: 20px;
        outline: none !important;
        border-bottom: 1px solid #0003;
        width: 100%;
        margin-left: 0;

        &::-webkit-input-placeholder {
          color: rgba(255,255,255,0.5);
        }
      }
    }

    .song-list {
      padding-left: 20px;
      padding-right: 20px;

      .song-item {
        color: #fffc;
        opacity: 0.8;
        transition: 0.3s;
        height: 70px;
        border-bottom: 1px solid #fff5;
        overflow: hidden;
        position: relative;
        box-shadow: 0 0 0;

        &.disabled {
          opacity: 0.3;
        }

        &.played {
          opacity: 1;

          .song-order {
            color: #409EFF80;
            text-shadow: 0 0 5px #409EFF;
          }
        }

        &:hover {
          height: 70px;
          opacity: 1;
          box-shadow: 0 0 10px #0003;
          border-bottom: 1px solid transparent;
          
          &.played {
            .song-order {
              color: #409EFF80;
            }
          }

          &.disabled {
            opacity: 0.3;
          }

          .song-artist {
            left: 100px;
            width: 250px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          
          .song-order {
            color: #fff5;
            vertical-align: 10px;
          }

          .song-cover {
            filter: blur(5px);
            opacity: 0.4;
            transform: rotate(-30deg);
            width: 100px;
            height: 100px;
            top: -20px;
            left: 0;
          }

          .song-name {
            font-weight: bold;
            margin-left: 100px;
            font-size: 22px;
            color: #fff;
          }

          .operation-icon {
            bottom: 5px;
            opacity: 0.8;
          }
        }

        .song-order {
          font-size: 80px;
          font-weight: bold;
          color: #fff3;
          vertical-align: 30px;
          transition: 0.3s;
          position: absolute;
          z-index: 2;
        }

        .song-cover {
          width: 50px;
          height: 50px;
          vertical-align: top;
          position: absolute;
          top: 10px;
          left: 80px;
          z-index: 0;
          opacity: 0.8;
          filter: blur(0);
          transform: rotate(0);
          transition: 0.4s;
        }

        .song-name {
          font-size: 18px;
          display: inline-block;
          vertical-align: top;
          line-height: 50px;
          margin-left: 150px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #fff;
          font-weight: normal;
          transition: 0.3s
        }

        .song-artist {
          font-size: 14px;
          position: absolute;
          bottom: 5px;
          left: 70%;
          display: inline-block;
          vertical-align: top;
          padding-top: 20px;
          transition: 0.3s;
        }

        @for $i from 1 through 3 {
          .operation-icon-#{$i} {
            position: absolute;
            bottom: -30px;
            left: #{350 + $i * 28}px;
            transition: 0.3s #{($i - 1) * 0.1}s;
            text-shadow: 0 2px 5px #0008;
            cursor: pointer;
            opacity: 0;
          }
        }
      }
    }
  }
</style>