<template>
  <div :class="`list-songs ${className || ''}`">
    <div
      v-for="(s, i) in songs"
      :key="s"
      :class="`song-item ${!allSongs[s].url ? 'disabled' : 'hasUrl'}`"
      @click="playMusic(s, songs)"
    >
      <div class="song-order" v-if="showIndex">{{i+1}}</div>
      <div v-if="(favSongMap[allSongs[s].platform] && favSongMap[allSongs[s].platform][s])" class="liked-item" />
      <div class="playing-bg" v-if="playNow.aId === s" :style="`width: ${playingPercent * 100}%`">
        <div class="wave-bg"></div>
        <div class="wave-bg2"></div>
      </div>
      <div v-if="countMap && countMap[s]" class="count-bg" :style="`width: ${countMap[s].score}%`"></div>
      <div class="song-album-img" :style="`background-image: url('${allSongs[s].al && `${allSongs[s].al.picUrl}?param=50y50`}')`"></div>
      <div class="song-name">{{allSongs[s].name}}</div>
      <div>
        <div class="song-ar">{{allSongs[s].ar.map((a) => a.name).join('/')}}</div>
        <div class="song-operation">
          <i
            v-if="favSongMap[allSongs[s].platform]"
            @click="likeMusic(s)"
            :class="`operation-icon operation-icon-1 iconfont icon-${Boolean(favSongMap[allSongs[s].platform][s]) ? 'like' : 'unlike'}`"
          />
          <i
            v-if="allSongs[s].platform !== 'migu'"
            @click="playlistTracks(s, 'add', 'ADD_SONG_2_LIST')"
            class="operation-icon operation-icon-2 iconfont icon-add"
          />
          <i
            v-if="!!allSongs[s].url && playingList.map[s]"
            @click="removePlaying(s)"
            class="operation-icon operation-icon-3 iconfont icon-list-reomve"
          />
          <i
            v-if="!!allSongs[s].url && !playingList.map[s]"
            @click="addPlaying(s)"
            class="operation-icon operation-icon-3 iconfont icon-list-add"
          />
          <i
            v-if="!!allSongs[s].url"
            @click="download(s)"
            class="operation-icon operation-icon-4 iconfont icon-download"
          />
          <span v-if="countMap && countMap[s]" class="played-count-num">{{countMap[s].count}}</span>
        </div>
      </div>
    </div>
    <div v-if="(songs || []).length === 0" class="text-center mt_40">{{emptyText || '没啥歌曲哟'}}</div>
    <div class="play-btn" v-else @click="playList(songs)">
      <i class="iconfont icon-play" />
      <span class="btn-txt">播放列表</span>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from "vuex";
  import { likeMusic, download } from "../../assets/utils/request";
  import { handlePlayingList } from "../../assets/utils/util";

  export default {
    name: "song",
    props: {
      songs: Array,
      className: String,
      emptyText: String,
      countMap: Object,
      showIndex: Boolean,
      showCover: Boolean,
    },
    computed: {
      ...mapGetters({
        allSongs: 'getAllSongs',
        playNow: 'getPlaying',
        playingPercent: 'getPlayingPercent',
        favSongMap: 'getFavSongMap',
        playingList: 'getPlayingList',
      })
    },
    methods: {

      ...handlePlayingList,

      likeMusic,

      download,

      playlistTracks(tracks, op, type, platform) {
        window.event.stopPropagation();
        this.$store.dispatch('setOperation', { data: { tracks, op }, type, platform });
      },
    }
  }
</script>

<style lang="scss">
  .list-songs {
    color: #fff9;

    &.search-page {
      .song-item {
        border-bottom: 1px solid #fff3;
        color: #fff8;
        transition: 0.3s;
        height: 60px;
        line-height: 60px;
        position: relative;
        overflow: hidden;

        &.hasUrl:hover {
          background: rgba(255,255,255,0.2);

          .song-album-img {
            background-size: 80px 80px;
            opacity: 0.4;
            filter: blur(2px);
          }

          .song-name {
            color: #fffc;
            font-size: 16px;
            transform: scale(1.2) translate(0) !important;
          }

          .song-ar {
            opacity: 0;
            width: 0;
          }

          .song-operation {
            opacity: 1;

            .iconfont {
              letter-spacing: 20px;
            }
          }
        }

        >span, >div {
          vertical-align: top;
        }

        .song-order {
          display: inline-block;
          width: 40px;
          padding-left: 20px;
        }

        .song-name {
          display: inline-block;
          width: 40%;
          font-size: 16px;
          transform: scale(1) translate(50px);
          transform-origin: left;
          transition: 0.3s;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          top: 0;
        }

        .song-album-img {
          width: 90px;
          height: 60px;
          position: absolute;
          overflow: hidden;
          left: 20px;
          background-size: 40px 40px;
          display: inline-block;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.8;
          z-index: -1;
          transition: 0.3s
        }

        .song-ar {
          display: inline-block;
          width: 30%;
          vertical-align: top;
          font-size: 14px;
          height: 60px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          opacity: 1;
          transition: 0.3s;
          left: 60%;
          top: 0;
        }

        .song-operation {
          display: inline-block;
          transition: 0.4s 0.1s;
          opacity: 0;
          position: absolute;
          top: 0;
          height: 60px;
          line-height: 60px;
          left: 60% !important;

          .iconfont {
            position: relative;
            left: 0 !important;
            top: 0;
            letter-spacing: 90px;
            transition: 0.3s 0.2s;
          }
        }
      }
    }

    .song-item {
      height: 55px;
      position: relative;
      border-bottom: 1px solid #fff3;
      overflow: hidden;
      transition: 0.3s;
      box-sizing: border-box;

      &.disabled {
        opacity: 0.3;

        &:hover {
          .song-name {
            font-size: 16px;
            font-weight: normal;
          }
        }
      }

      .count-bg {
        height: 100%;
        position: absolute;
        background: #67C23A33;
        left: 0;
        top: 0;
        z-index: 0;
      }

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

    @for $i from 1 to 5 {
      .operation-icon-#{$i} {
        position: absolute;
        bottom: 20px;
        left: calc(60% + #{$i * 30}px);
        cursor: pointer;
        font-size: 14px !important;
        transition: 0.3s;
      }
    }
    .played-count-num {
      position: absolute;
      bottom: 15px;
      font-weight: bold;
      right: 30px;
      color: #fff8;
    }

    .play-btn {
      position: fixed;
      bottom: 120px;
      right: 40px;
      width: 50px;
      height: 50px;
      border-radius: 25px;
      background: #F23C3C;
      border: 2px solid #F23C3C;
      opacity: 0.3;
      cursor: pointer;
      box-shadow: 0 0 20px #333;
      transition: 0.3s;
      overflow: hidden;
      z-index: 10;
      text-align: center;
      white-space: nowrap;

      .iconfont {
        font-size: 22px;
        color: #fff;
        line-height: 50px;
        padding-left: 15px;
        transition: 0.3s;
      }
      .btn-txt {
        width: 0;
        overflow: hidden;
        font-size: 14px;
        vertical-align: top;
        padding-left: 10px;
        opacity: 0;
      }

      &:hover {
        opacity: 0.7;
        width: 130px;
        font-size: 14px;
        line-height: 50px;

        .iconfont {
          padding-left: 0;
        }

        .btn-txt {
          width: 100px;
          opacity: 1;
        }
      }

    }
  }
</style>