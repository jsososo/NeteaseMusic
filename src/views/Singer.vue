<template>
  <div class="singer-page-container">
    <div class="singer-main-info">
      <div>
        <img class="singer-img" :src="`${baseInfo.picUrl}?param=300y300`">
        <div class="singer-name">
          {{baseInfo.name}}
          <div class="singer-name-alia">{{(baseInfo.alias || []).join('、')}}</div>
          <div class="singer-info-from">信息来源：{{{ 163: '网易云', qq: '企鹅音乐', migu: '咪咕～' }[platform]}}</div>
        </div>
        <div class="base-desc">{{baseInfo.desc}}</div>
      </div>
    </div>
    <div class="singer-detail-info">
      <div class="right-select-tab-list">
        <div
          :class="`tab-item-${i} c-${t.color} ${selected === t.key && 'selected'}`"
          v-for="(t, i) in tabs"
          :key="t.icon"
          @click="selected = t.key"
        >
          <i :class="`iconfont icon-${t.icon}`" />
          {{t.val}}
        </div>
      </div>
      <!-- 热门歌曲 -->
      <SongList :songs="info.songs" v-if="selected === 'songs'" />

      <!-- 专辑 -->
      <AlbumList :albums="info.albums" v-if="selected === 'albums'" />

      <!-- 信息 -->
      <div class="descs-list" v-if="selected === 'descs'">
        <div v-for="d in info.descs" :key="d.ti">
          <div class="desc-title">{{d.ti}}</div>
          <div class="desc-txt" v-html="d.txt"></div>
        </div>
        <div v-if="info.descs.length === 0" class="text-center mt_40">没啥消息哟</div>
      </div>

      <!-- 相似歌手 -->
      <SingerList v-if="selected === 'sims'" :singers="info.sims" empty-text="谁也不像" />
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import request, { handleSongs, likeMusic, download } from '../assets/utils/request';
  import { changeUrlQuery } from "../assets/utils/stringHelper";
  import SongList from '../components/list/song';
  import AlbumList from '../components/list/album';
  import SingerList from '../components/list/singer';

  export default {
    name: "Singer",
    components: {
      SongList,
      AlbumList,
      SingerList,
    },
    data() {
      return {
        id: this.$route.query.id,
        mid: this.$route.query.mid,
        platform: this.$route.query.from || '163',
        baseInfo: {},
        info: {
          songs: [],
          descs: [],
          albums: [],
          sims: [],
        },
        selected: 'songs',
        tabs: [
          {
            icon: 'song',
            key: 'songs',
            color: 'red',
            val: '热门歌曲'
          },
          {
            icon: 'album',
            color: 'blue',
            key: 'albums',
            val: '专辑',
          },
          {
            icon: 'info',
            color: 'green',
            key: 'descs',
            val: '详细信息',
          },
          {
            icon: 'link',
            color: 'yellow',
            key: 'sims',
            val: '相似歌手',
          }
        ],
      }
    },
    computed: {
      ...mapGetters({
        allSongs: 'getAllSongs',
        playNow: 'getPlaying',
        playingPercent: 'getPlayingPercent',
        favSongMap: 'getFavSongMap',
      })
    },
    watch: {
      $route(v) {
        this.id = v.query.id;
        this.mid = v.query.mid;
        this.platform = v.query.from || '163';
        this.info = {
          songs: [],
          descs: [],
          albums: [],
          sims: [],
        };
        this.querySinger();
        this.queryTabInfo();
      },
      selected() {
        this.queryTabInfo();
      }
    },
    created() {
      this.querySinger();
      this.queryTabInfo();
    },
    methods: {
      querySinger() {
        const { id, mid, platform } = this;
        const { dispatch } = this.$store;
        dispatch('updateShowCover', false);
        const data = {
          id: {
            163: id,
            migu: id,
            qq: mid,
          }[platform],
          _p: platform,
        };

        request({ api: 'SINGER_INFO', data })
          .then(({ data }) => {
            this.baseInfo = data;
            this.info.descs = data.intro || [];
          });
      },

      queryTabInfo() {
        const { id, mid, platform, selected } = this;
        const data = {
          id: {
            163: id,
            migu: id,
            qq: mid,
          }[platform],
          _p: platform,
        };

        switch (selected) {
          case 'songs':
            request({ api: 'SINGER_SONG', data })
              .then(({ data }) => handleSongs(data))
              .then((ids) => this.info.songs = ids);
            break;
          case 'sims':
            request({ api: 'SINGER_SIM', data })
              .then(({ data }) => this.info.sims = data);
            break;
          case 'albums':
            request({ api: 'SINGER_ALBUM', data })
              .then(({ data }) => this.info.albums = data);
            break;
        }
      },

      likeMusic,
      playlistTracks(tracks, op, type, platform) {
        window.event.stopPropagation();
        this.$store.dispatch('setOperation', { data: { tracks, op }, type, platform });
      },
      playMusic(id) {
        const { dispatch } = this.$store;
        const { allSongs } = this;
        const song = allSongs[id];
        if (!song.url) {
          return;
        }
        dispatch('updatePlayNow', song);
        dispatch('updatePlayingList', { list: this.info.songs });
        dispatch('updatePlayingStatus', true);
      },
      goTo(url) { window.location = url },
      download,
      changeUrlQuery,
    },
  }
</script>

<style lang="scss" scoped>
  .singer-page-container {
    color: #fffc;

    .singer-main-info {
      display: inline-block;
      width: 60%;
      padding-left: 150px;
      padding-top: 30px;
      box-sizing: border-box;

      .singer-img {
        width: 200px;
        height: 200px;
        opacity: 0.8;
        border-radius: 30px;
      }

      .singer-name {
        display: inline-block;
        vertical-align: top;
        font-size: 24px;
        font-weight: bold;
        width: calc(100% - 380px);
        padding-left: 20px;
        padding-top: 20px;
        
        .singer-name-alia, .singer-info-from {
          font-size: 12px;
          font-weight: normal;
          color: #fff5;
          margin-top: 5px;
        }
      }

      .base-desc {
        font-size: 14px;
        font-weight: normal;
        color: #fff8;
        width: calc(100% - 150px);
        height: calc(100vh - 370px);
        overflow: auto;
        text-indent: 2em;
        margin-top: 20px;

        &::-webkit-scrollbar {
          width: 0;
          height:8px;
          background-color:rgba(0,0,0,0);
        }
      }
    }

    .singer-detail-info {
      width: 40%;
      background: #0003;
      border-left: 1px solid #fff8;
      box-sizing: border-box;
      display: inline-block;
      vertical-align: top;
      position: relative;
      height: calc(100vh - 120px);

      .descs-list, .list-albums, .list-songs, .list-singers {
        height: calc(100vh - 120px);
        box-sizing: border-box;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 0;
          height:8px;
          background-color:rgba(0,0,0,0);
        }
      }

      .descs-list {
        padding: 20px;

        .desc-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 15px;
        }

        .desc-txt {
          font-size: 14px;
          text-indent: 2em;
          margin-bottom: 30px;
          opacity: 0.7;
        }
      }
    }
  }
</style>