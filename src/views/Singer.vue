<template>
  <div class="singer-page-container">
    <div class="singer-main-info">
      <div>
        <img class="singer-img" :src="baseInfo.img1v1Url">
        <div class="singer-name">
          {{baseInfo.name}}
          <div class="singer-name-alia">{{(baseInfo.alias || []).join('、')}}</div>
          <div class="singer-info-from">信息来源：{{{ 163: '网易云', qq: '企鹅音乐', migu: '咪咕～' }[platform]}}</div>
        </div>
        <div class="base-desc">{{baseInfo.briefDesc}}</div>
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
      <div class="song-list" v-if="selected === 'songs'">
        <div
          v-for="s in info.songs"
          :key="s"
          class="song-item"
          @click="playMusic(s)"
        >
          <div  v-if="(favSongMap[platform] && favSongMap[platform][s])" class="liked-item"></div>
          <div class="playing-bg" v-if="playNow.id === s" :style="`width: ${playingPercent * 100}%`">
            <div class="wave-bg"></div>
            <div class="wave-bg2"></div>
          </div>
          <div class="song-name">{{allSongs[s].name}}</div>
          <div>
            <div class="song-ar">{{allSongs[s].ar.map((a) => a.name).join('/')}}</div>
            <div class="song-operation">
              <i
                v-if="favSongMap[platform] && platform === '163'"
                @click="likeMusic(s)"
                :class="`operation-icon operation-icon-1 iconfont icon-${Boolean(favSongMap[platform][s]) ? 'like' : 'unlike'}`"
              />
              <i
                v-if="platform === '163'"
                @click="playlistTracks(s, 'add', 'ADD_SONG_2_LIST')"
                class="operation-icon operation-icon-2 iconfont icon-add"
              />
              <i
                @click="download(s)"
                class="operation-icon operation-icon-3 iconfont icon-download"
              />
            </div>
          </div>
        </div>
        <div v-if="info.songs.length === 0" class="text-center mt_40">没啥歌曲哟</div>
      </div>

      <!-- 专辑 -->
      <div class="album-list" v-if="selected === 'albums'" @scroll="onScroll('.singer-page-container .album-list')">
        <div
          v-for="a in info.albums"
          :key="a.id"
          class="album-item"
        >
          <div class="album-img-container pointer" @click="goTo(changeUrlQuery({ id: a.id, mid: a.mid, from: platform }, '#/album', false))">
            <img :src="`${a.picUrl}?param=200y200`" alt="">
          </div>
          <div class="album-name pointer" @click="goTo({ id: a.id, mid: a.mid, from: platform }, '#/album', false)">{{a.name}}</div>
        </div>
        <div v-if="info.albums.length === 0" class="text-center mt_40">没啥专辑哟</div>
      </div>

      <!-- 信息 -->
      <div class="descs-list" v-if="selected === 'descs'">
        <div v-for="d in info.descs" :key="d.ti">
          <div class="desc-title">{{d.ti}}</div>
          <div class="desc-txt" v-html="d.txt"></div>
        </div>
        <div v-if="info.descs.length === 0" class="text-center mt_40">没啥消息哟</div>
      </div>

      <!-- 相似歌手 -->
      <div class="simi-list" v-if="selected === 'simis'">
        <div v-for="s in info.simis" class="singer-item" @click="changeUrlQuery({ id: s.id, mid: s.mid, from: platform }, '#/singer')">
          <img class="singer-img" :src="`${String(s.img1v1Url) === 'null' ? 'http://p3.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg' : s.img1v1Url}?param=120y120`"  />
          <div class="singer-name">{{s.name}}</div>
        </div>
        <div v-if="(info.simis || []).length === 0" class="text-center mt_40">谁也不像</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import request, { handleSongs, likeMusic, download, handleQQSongs, handleMiguSongs } from '../assets/utils/request';
  import { changeUrlQuery } from "../assets/utils/stringHelper";
  import $ from 'jquery';

  export default {
    name: "Singer",
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
            key: 'simis',
            val: '相似歌手',
          }
        ],
        albumQ: {
          limit: 30,
          offset: 0,
        }
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
      },
    },
    created() {
      this.querySinger();
    },
    methods: {
      querySinger() {
        const { id, mid: singermid, platform } = this;
        const { dispatch } = this.$store;
        dispatch('updateShowCover', false);

        // 专辑
        this.queryAlbum();

        if (platform === 'qq') {
          // 歌手详情
          request({
            api: 'QQ_SINGER_DESC',
            data: { singermid },
          }).then((res) => {
            if (!res.data) return;
            const name = (res.data.basic.item.find((obj) => obj.key === '中文名') || { value: '' }).value;
            const alias = (res.data.basic.item.find((obj) => obj.key === '外文名') || { value: '' }).value.split(',');
            this.baseInfo = {
              img1v1Url: `https://y.gtimg.cn/music/photo_new/T001R300x300M000${singermid}.jpg`,
              name,
              alias,
              briefDesc: res.data.desc,
            };
            this.info.descs = (res.data.other.item || []).map((item) => ({ ti: item.key, txt: item.value }));
          });

          // 相似歌手
          request({
            api: 'QQ_SINGER_SIM',
            data: { singermid },
          }).then((res) => {
            this.info.simis = (res.data.list || []).map((item) => ({ ...item, img1v1Url: item.pic }));
          });

          // 歌曲
          request({
            api: 'QQ_SINGER_SONGS',
            data: { singermid, num: 50 },
          }).then((res) => {
            this.info.songs = handleQQSongs(res.data.list);
          });
          return;
        }

        if (platform === 'migu') {
          // 歌手详情
          request({ api: 'MIGU_SINGER_DESC', data: { id }})
            .then(res => {
              const { picUrl, name, desc } = res.data;
              this.baseInfo = {
                img1v1Url: picUrl,
                name,
              };
              this.info.descs = [{ txt: desc.replace(/\n/g, '<br/>') }];
            });

          // 歌曲列表
          request({ api: 'MIGU_SINGER_SONGS', data: { id }})
            .then(res => {
              this.info.songs = handleMiguSongs(res.data.list);
            });
          return;
        }

        // 信息
        request({
          api: 'GET_SINGER_DESC',
          data: { id },
          cache: true,
        }).then((res) => {
          this.info.descs = res.introduction || [];
        });

        // 热门歌曲
        request({
          api: 'GET_SINGER_SONGS',
          data: { id },
          cache: true,
        }).then((res) => {
          this.baseInfo = res.artist;
          handleSongs(res.hotSongs);
          this.info.songs = (res.hotSongs || []).map((item) => item.id);
        });

        // 相似歌手
        request({
          api: 'SIMI_ARTIST',
          data: { id },
          cache: true,
        }).then((res) => this.info.simis = res.artists);
      },

      queryAlbum(offset = 0) {
        const { albumQ, info, platform, mid: singermid, id } = this;
        if (offset !== 0 && albumQ.loading) {
          return;
        }
        if (offset > 0 && offset > info.albums.length) {
          return;
        }
        albumQ.loading = true;

        if (platform === 'qq') {
          return request({
            api: 'QQ_SINGER_ALBUMS',
            data: { singermid, pageNo: offset / 30 + 1, pageSize: 30 },
          }).then((res) => {
            const list = res.data.list.map(({ albumid, album_mid, album_name}) => ({
              id: albumid,
              mid: album_mid,
              name: album_name,
              picUrl: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${album_mid}.jpg`
            }));
            if (offset === 0) {
              info.albums = list;
            } else {
              info.albums = [ ...info.albums, ...list];
            }
            this.albumQ = {
              offset: offset + 30,
              loading: false,
            }
          })
        }

        if (platform === 'migu') {
          return request({
            api: 'MIGU_SINGER_ALBUMS',
            data: { id, pageno: offset / 30 + 1 },
          }).then(res => {
            const albums = res.data.list.map(({ id, picUrl, name, artists}) => ({
              id,
              name,
              picUrl,
            }));
            if (offset === 0) {
              this.info.albums = albums;
            } else {
              this.info.albums = [ ...this.info.albums, ...albums ];
            }
            this.albumQ = {
              offset: offset + 30,
              loading: false,
            }
          });
        }

        request({
          api: 'GET_SINGER_ALBUMS',
          data: { offset, limit: 30, id: this.id }
        }).then((res) => {
          if (offset === 0) {
            this.info.albums = [];
          }
          this.info.albums = [ ...this.info.albums, ...(res.hotAlbums || [])];
          this.albumQ = {
            offset: offset + 30,
            loading: false,
          }
        })
      },
      onScroll(cls) {
        const el = $(cls);
        const viewH = el.height(); // 可见高度
        const contentH = el.get(0).scrollHeight; // 内容高度
        const scrollTop = el.scrollTop(); // 滚动高度
        if (contentH - viewH - scrollTop < 150) {
          if (this.selected === 'albums') {
            this.queryAlbum(this.albumQ.offset);
          }
        }
      },
      likeMusic: likeMusic,
      playlistTracks(tracks, op, type) {
        window.event.stopPropagation();
        this.$store.dispatch('setOperation', { data: { tracks, op }, type });
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

      .descs-list, .song-list, .album-list, .simi-list {
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

      .song-list {

        .song-item {
          height: 55px;
          position: relative;
          border-bottom: 1px solid #fff3;
          overflow: hidden;
          transition: 0.3s;
          box-sizing: border-box;

          .liked-item {
            position: absolute;
            height: 100%;
            width: 1px;
            left: 0;
            top: 0;
            box-shadow: 0 0 10px 4px #F56C6C;
          }

          &:hover {
            background: #0003;

            .song-name {
              font-weight: bold;
              font-size: 20px;
            }

            .song-ar {
              opacity: 0.3;
            }

            .operation-icon {
              font-size: 16px;
            }
          }

          div {
            box-sizing: border-box;
          }

          .song-name {
            display: inline-block;
            width: 60%;
            vertical-align: top;
            position: absolute;
            top: 10px;
            left: 40px;
            transition: 0.3s;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .song-ar {
            vertical-align: top;
            display: inline-block;
            width: 30%;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            position: absolute;
            bottom: 5px;
            opacity: 0.6;
            left: 40px;
            font-size: 12px;
            transition: 0.3s;
          }
        }

        @for $i from 1 to 4 {
          .operation-icon-#{$i} {
            position: absolute;
            bottom: 20px;
            left: calc(60% + #{$i * 30}px);
            cursor: pointer;
            font-size: 14px !important;
            transition: 0.3s;
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

      .simi-list {
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
  }
</style>