<template>
  <div :class="`list-songs ${className || ''}`">
    <div
      v-for="s in songs"
      :key="s"
      :class="`song-item ${!allSongs[s].url ? 'disabled' : ''}`"
      @click="playMusic(s)"
    >
      <div v-if="(favSongMap[allSongs[s].platform] && favSongMap[allSongs[s].platform][s])" class="liked-item" />
      <div class="playing-bg" v-if="playNow.id === s" :style="`width: ${playingPercent * 100}%`">
        <div class="wave-bg"></div>
        <div class="wave-bg2"></div>
      </div>
      <div v-if="countMap && countMap[s]" class="count-bg" :style="`width: ${countMap[s].score}%`"></div>
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
            v-if="!!allSongs[s].url"
            @click="download(s)"
            class="operation-icon operation-icon-3 iconfont icon-download"
          />
          <span v-if="countMap && countMap[s]" class="played-count-num">{{countMap[s].count}}</span>
        </div>
      </div>
    </div>
    <div v-if="(songs || []).length === 0" class="text-center mt_40">{{emptyText || '没啥歌曲哟'}}</div>
  </div>
</template>

<script>
  import { mapGetters } from "vuex";
  import { likeMusic, download } from "../../assets/utils/request";

  export default {
    name: "song",
    props: {
      songs: Array,
      className: String,
      emptyText: String,
      countMap: Object,
    },
    computed: {
      ...mapGetters({
        allSongs: 'getAllSongs',
        playNow: 'getPlaying',
        playingPercent: 'getPlayingPercent',
        favSongMap: 'getFavSongMap',
      })
    },
    methods: {
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
    .played-count-num {
      position: absolute;
      bottom: 15px;
      font-weight: bold;
      right: 30px;
      color: #fff8;
    }
  }
</style>