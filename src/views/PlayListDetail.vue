<template>
  <div class="list-detail-container">
    <div v-if="!listInfo && loading && list.length === 0" class="text-center fc_fff ft_20" style="padding-top: 100px;opacity: 0.8;letter-spacing: 2px;">拼命查找了！</div>
    <div v-if="listInfo" class="list-info-detail">
      <div>
        <img class="list-info-cover" :src="`${listInfo.coverImgUrl}?param=100y100`">
        <div class="list-info-txt">
          <div class="list-info-name">{{listInfo.name}}</div>
          <div class="list-info-creator" v-if="listInfo.creator && platform === '163'">
            By <a :href="`#/user?id=${listInfo.creator.userId}`"><span class="creator-name">{{listInfo.creator.nickname}}</span></a>
          </div>
          <div class="list-info-creator" v-if="listInfo.creator && platform !== '163'">
            By <span class="creator-name">{{listInfo.creator.nickname}}</span>
          </div>
        </div>
      </div>
      <div>
        <input v-model="search" class="search-input" type="text" placeholder="找呀找呀找歌曲">
        <div @click="playListShow" v-if="list.length > 0" class="inline-block mt_15 pt_5 pointer play" style="line-height: 20px;">
          <i class="iconfont icon-play pl_10 pr_10" />
          播放下列歌曲
        </div>
      </div>
    </div>
    <div class="song-list" v-if="allList[trueId]">
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
        <div class="icon-container">
          <i
            v-if="allList[userList.favId] && (id != userList.favId) && platform === '163'"
            @click="likeMusic(s)"
            :class="`operation-icon operation-icon-1 iconfont icon-${allList[userList.favId].indexOf(s) > -1 ? 'like' : 'unlike'}`"
          />
          <i
            v-if="platform === '163'"
            @click="playlistTracks(s, id, 'add', 'ADD_SONG_2_LIST')"
            class="operation-icon operation-icon-2 iconfont icon-add"
          />
          <i
            v-if="!!allSongs[s].url"
            @click="download(s)"
            class="operation-icon operation-icon-3 iconfont icon-download"
          />
          <i
            @click="playlistTracks(s, id, 'del', 'DEL_SONG')"
            v-if="platform === '163' && userList.obj && userList.obj[id] && !userList.obj[id].subscribed && (id !== userList.favId)"
            class="operation-icon operation-icon-4 iconfont icon-delete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getQueryFromUrl } from "../assets/utils/stringHelper";
  import { getPlayList, likeMusic, download, getQQPlayList } from "../assets/utils/request";
  import { mapGetters } from 'vuex';

  export default {
    name: "PlayListDetail",
    data() {
      return {
        id: getQueryFromUrl('id'),
        trueId: '',
        search: '',
        list: [],
        listInfo: null,
        loading: true,
        platform: getQueryFromUrl('from') || '163',
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
        this.platform = this.$route.query.from || '163';
        this.init();
      }
    },
    created() {
      const { allList, id, userList, platform } = this;
      this.trueId = `${platform === '163' ? '' : 'qq'}${id}`;
      this.list = allList[this.trueId] || [];
      this.listInfo = (userList && userList.obj && userList.obj[id]) || null;
      this.init();
    },
    methods: {
      init() {
        if (this.id === 'daily') {
          return this.list = this.allList.daily || [];
        }
        this.loading = true;
        if (this.platform === 'qq') {
          getQQPlayList(this.id)
            .then(({ dissname, nickname, logo }) => {
              this.listInfo = {
                name: dissname,
                creator: { nickname },
                coverImgUrl: logo,
                platform: 'qq',
              };
              this.loading = false;
            });
        } else {
          getPlayList(this.id)
            .then(({ playlist }) => {
              const { name, creator, coverImgUrl, playCount } = playlist;
              this.listInfo = { name, creator, coverImgUrl, playCount, platform: '163' };
              this.loading = false;
            })
        }
      },
      playMusic(id) {
        const { allSongs, allList, trueId, platform } = this;
        const { dispatch } = this.$store;
        const song = allSongs[id];
        if (!song.url) {
          return;
        }
        dispatch('updatePlayNow', song);
        dispatch('updatePlayingList', { list: allList[trueId], id: trueId });
        dispatch('updatePlayingStatus', true);
      },
      playListShow() {
        const { allSongs, list, trueId: id } = this;
        const { dispatch } = this.$store;
        const song = allSongs[list[0]];
        if (!song.url) {
          return;
        }
        dispatch('updatePlayNow', song);
        dispatch('updatePlayingList', { list, id });
        dispatch('updatePlayingStatus', true);
      },
      searchList() {
        const { search, allList, trueId: id, allSongs, platform } = this;
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
      download,
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
        width: 100px;
        height: 100px;
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
        width: calc(100% - 140px);
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
            transform: translate(90px);
          }
          
          .song-order {
            color: #fff5;
            transform: translate(0, 10px);
          }

          .song-cover {
            filter: blur(5px);
            opacity: 0.4;
            transform: rotate(-30deg) scale(2) translate(0, 10px);
          }

          .song-name {
            font-weight: bold;
            transform: scale(1.22) translate(75px);
            color: #fff;
          }

          .icon-container {
            .operation-icon {
              transform: translate(0, 0);
              opacity: 0.8;
            }
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
          z-index: 0;
          opacity: 0.8;
          filter: blur(0);
          transform: rotate(0) scale(1) translate(65px, 10px);
          transition: 0.4s;
        }

        .song-name {
          font-size: 18px;
          display: inline-block;
          vertical-align: top;
          line-height: 50px;
          transform: translate(150px);
          transform-origin: left;
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
          left: 0;
          transform: translate(400px);
          display: inline-block;
          vertical-align: top;
          padding-top: 20px;
          transition: 0.3s;
          max-width: 250px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .icon-container {
          position: absolute;
          bottom: 5px;
          left: 350px;

          @for $i from 1 through 5 {
            .operation-icon-#{$i} {
              transform: translate(0, 40px);
              transition: 0.3s #{($i - 1) * 0.1}s;
              text-shadow: 0 2px 5px #0008;
              cursor: pointer;
              margin-right: 12px;
              opacity: 0;
            }
          }
        }
      }
    }
  }
</style>