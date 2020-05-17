<template>
  <div class="album-page-container">
    <div class="album-main-info">
      <div>
        <img class="album-img" :src="baseInfo.picUrl">
        <div class="album-name">
          {{baseInfo.name}}
          <div class="album-name-alia">{{(baseInfo.alias || []).join('、')}}</div>
          <div class="album-artist" v-if="baseInfo.ar">
            <a v-for="a in baseInfo.ar" :key="a.id" :href="changeUrlQuery({ id: a.id, mid: a.mid, from: a.platform }, '#/singer', false)">{{a.name}} </a>
          </div>
          <div class="album-company" v-if="baseInfo.company">发行：{{baseInfo.company}}</div>
          <div class="album-pb-time">{{handleTime(baseInfo.publishTime)}}</div>
          <div class="album-info-from">信息来源：{{{ 163: '网易云', qq: '企鹅音乐', migu: '咪咕～' }[platform]}}</div>
        </div>
        <div class="base-desc" v-if="baseInfo.desc" v-html="baseInfo.desc"></div>
      </div>
    </div>
    <div class="album-right-list">
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
      <SongList v-if="selected === 'songs'" :songs="info.songs || []" />
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import request, {handleSongs, likeMusic} from '../assets/utils/request';
  import timer from '../assets/utils/timer';
  import { changeUrlQuery } from "../assets/utils/stringHelper";
  import SongList from '../components/list/song';

  export default {
    name: "Album",
    components: { SongList },
    data() {
      return {
        selected: 'songs',
        tabs: [
          {
            icon: 'song',
            key: 'songs',
            color: 'red',
            val: '歌曲',
          },
        ],
        info: {
          songs: [],
        },
        id: this.$route.query.id,
        mid: this.$route.query.mid,
        platform: this.$route.query.from || '163',
        baseInfo: {},
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
        this.queryAlbum();
      },
    },
    created() {
      this.queryAlbum();
    },
    methods: {
      queryAlbum() {
        const { platform , mid: albummid, id } = this;
        this.$store.dispatch('updateShowCover', false);
        request({
          api: 'ALBUM',
          data: {
            id: platform === 'qq' ? albummid : id,
            _p: platform
          }
        }).then(({ data }) => {
          this.baseInfo = data;
          return handleSongs(data.list || []);
        }).then((ids) => this.info.songs = ids);
      },
      likeMusic,
      playlistTracks(tracks, op, type, platform = '163') {
        window.event.stopPropagation();
        this.$store.dispatch('setOperation', { data: { tracks, op }, type, platform });
      },
      handleTime(t) {
        return timer(t).str('YYYY-MM-DD')
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
      changeUrlQuery,
    }
  }
</script>

<style lang="scss" scoped>
  .album-page-container {
    color: #fffc;

    .album-main-info {
      display: inline-block;
      width: 60%;
      padding-left: 150px;
      padding-top: 30px;
      box-sizing: border-box;

      .album-img {
        max-width: 200px;
        max-height: 200px;
        opacity: 0.8;
        border-radius: 30px;
      }

      .album-name {
        display: inline-block;
        vertical-align: top;
        font-size: 24px;
        font-weight: bold;
        width: calc(100% - 380px);
        padding-left: 20px;
        padding-top: 20px;

        .album-name-alia {
          font-size: 12px;
          font-weight: normal;
          color: #fff5;
          margin-top: 5px;
          margin-bottom: 30px;
        }
        .album-company, .album-pb-time, .album-artist, .album-info-from {
          margin-top: 5px;
          font-size: 14px;
          color: #fff8;
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
    .album-right-list {
      width: 40%;
      background: #0003;
      border-left: 1px solid #fff8;
      box-sizing: border-box;
      display: inline-block;
      vertical-align: top;
      position: relative;
      height: calc(100vh - 120px);

      .list-songs {
        height: calc(100vh - 120px);
        box-sizing: border-box;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 0;
          height:8px;
          background-color:rgba(0,0,0,0);
        }
      }
    }
  }
</style>