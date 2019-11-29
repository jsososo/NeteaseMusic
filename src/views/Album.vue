<template>
  <div class="album-page-container">
    <div class="album-main-info">
      <div>
        <img class="album-img" :src="baseInfo.picUrl">
        <div class="album-name">
          {{baseInfo.name}}
          <div class="album-name-alia">{{(baseInfo.alias || []).join('、')}}</div>
          <div class="album-artist" v-if="baseInfo.artists">
            <a v-for="a in baseInfo.artists" :key="a.id" :href="changeUrlQuery({ id: a.id, mid: a.mid, from: a.from }, '#/singer', false)">{{a.name}} </a>
          </div>
          <div class="album-company" v-if="baseInfo.company">发行：{{baseInfo.company}}</div>
          <div class="album-pb-time">{{baseInfo.publishTime}}</div>
          <div class="album-info-from">信息来源：{{{ 163: '网易云', qq: '企鹅音乐' }[platform]}}</div>
        </div>
        <div class="base-desc" v-if="baseInfo.description">{{baseInfo.description}}</div>
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
      <div class="song-list" v-if="selected === 'songs'">
        <div
          v-for="s in info.songs"
          :key="s"
          class="song-item"
          @click="playMusic(s)"
        >
          <div v-if="(allList[userList.favId] && allList[userList.favId].indexOf(s) > -1)" class="liked-item"></div>
          <div class="playing-bg" v-if="playNow.id === s" :style="`width: ${playingPercent * 100}%`">
            <div class="wave-bg"></div>
            <div class="wave-bg2"></div>
          </div>
          <div class="song-name">{{allSongs[s].name}}</div>
          <div>
            <div class="song-ar">{{allSongs[s].ar.map((a) => a.name).join('/')}}</div>
            <div class="song-operation">
              <i
                v-if="allList[userList.favId] && platform === '163'"
                @click="likeMusic(s)"
                :class="`operation-icon operation-icon-1 iconfont icon-${allList[userList.favId].indexOf(s) > -1 ? 'like' : 'unlike'}`"
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
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import request, { handleSongs, likeMusic, download, handleQQSongs } from '../assets/utils/request';
  import timer from '../assets/utils/timer';
  import { changeUrlQuery } from "../assets/utils/stringHelper";

  export default {
    name: "Album",
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
        allList: 'getAllList',
        userList: 'getUserList',
        allSongs: 'getAllSongs',
        playNow: 'getPlaying',
        playingPercent: 'getPlayingPercent'
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
        const { platform, mid: albummid } = this;
        this.$store.dispatch('updateShowCover', false);
        if (platform === 'qq') {
          request({
            api: 'QQ_ALBUM',
            data: { albummid },
          }).then((res) => {
            this.baseInfo = {
              ...res.data,
              description: res.data.desc,
              artists: res.data.ar.map((a) => ({ ...a, from: 'qq' }))
            }

          });

          return request({
            api: 'QQ_ALBUM_SONGS',
            data: { albummid },
          }).then((res) => {
            this.info.songs = handleQQSongs(res.data.list);
          })
        }
        request({
          api: 'GET_ALBUM',
          data: { id: this.id },
          cache: true,
        }).then((res) => {
          this.baseInfo = res.album;
          this.baseInfo.publishTime = timer(this.baseInfo.publishTime).str('YYYY-MM-DD');
          handleSongs(res.songs);
          this.info.songs = (res.songs || []).map((item) => item.id);
        })
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
      download,
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

      .song-list {
        height: calc(100vh - 120px);
        box-sizing: border-box;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 0;
          height:8px;
          background-color:rgba(0,0,0,0);
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
    }
  }
</style>