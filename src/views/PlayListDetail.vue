<template>
  <div class="list-detail-container" @scroll="getShowIndex">
    <div v-if="!listInfo && loading && list.length === 0" class="text-center fc_fff ft_20" style="padding-top: 100px;opacity: 0.8;letter-spacing: 2px;">拼命查找了！</div>
    <div v-if="!loading" class="list-info-detail">
      <div v-if="listInfo">
        <img class="list-info-cover" :src="listInfo.cover">
        <div class="list-info-txt">
          <div class="list-info-name">{{listInfo.name}}</div>
          <div class="list-info-creator">
            <el-tooltip
              v-if="userList[platform] && !userList[platform].mine[listId]"
              class="item"
              effect="dark"
              :content="userList[platform].sub[listId] ? '已收藏' : '收藏'"
              placement="top"
            >
              <i @click="collectPlaylist(listInfo)" :class="`collect-btn mr_10 iconfont icon-${userList[platform].sub[listId] ? 'collected' : 'collect'}`" />
            </el-tooltip>
            <span>By <span class="creator-name">{{listInfo.creator.nick}}</span></span>
          </div>
        </div>
      </div>
      <div>
        <input v-model="search" class="search-input" type="text" placeholder="找呀找呀找歌曲">
        <div class="inline-block mt_15 pt_5">下列歌曲：</div>
        <el-tooltip class="item" effect="dark" content="播放" placement="top">
          <div @click="playListShow(true)" v-if="list.length > 0" class="inline-block mt_15 pt_5 pointer play" style="line-height: 20px;">
            <i class="iconfont icon-play pl_10 pr_10" />
          </div>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="添加到播放列表" placement="top">
          <div @click="playListShow()" v-if="list.length > 0" class="inline-block mt_15 pt_5 pointer play" style="line-height: 20px;">
            <i class="iconfont icon-list-add pl_10 pr_10" />
          </div>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="下载" placement="top">
          <div @click="downShow" v-if="list.length > 0" class="inline-block mt_15 pt_5 pointer play" style="line-height: 20px;">
            <i class="iconfont icon-download pl_10 pr_10" />
          </div>
        </el-tooltip>
      </div>
    </div>
    <div class="song-list" v-if="allList[listId] || id === 'playing'">
      <div
        :class="`song-item ${playNow.aId === s ? 'played' : ''} ${!allSongs[s].url ? 'disabled' : ''} ${((i < smallIndex) || (i > bigIndex)) ? 'hidden' : ''}`"
        v-for="(s, i) in list"
        v-if="allSongs[s]"
        :key="`${s}-${i}`"
        @click="playMusic(s, list, listId)"
      >
        <div class="playing-bg" v-if="playNow.aId === s" :style="`width: ${playingPercent * 100}%`">
          <div class="wave-bg"></div>
          <div class="wave-bg2"></div>
        </div>
        <span class="song-order">{{i+1}}</span>
        <img class="song-cover" :src="`${allSongs[s].al && allSongs[s].al.picUrl}?param=50y50`" alt="" />
        <span class="song-name">{{allSongs[s].name}}</span>
        <span class="song-artist">{{(allSongs[s].ar || []).map((a) => a.name).join('/')}}</span>
        <div class="icon-container">
          <i
            v-if="userList[allSongs[s].platform] && (listId !== userList[allSongs[s].platform].favListId)"
            @click="likeMusic(s)"
            :class="`operation-icon operation-icon-1 iconfont icon-${!!favSongMap[allSongs[s].platform][s] ? 'like' : 'unlike'}`"
          />
          <i
            v-if="allSongs[s].from !== 'migu'"
            @click="playlistTracks(s, listId, 'add', 'ADD_SONG_2_LIST', allSongs[s].platform)"
            class="operation-icon operation-icon-2 iconfont icon-add"
          />
          <i
            v-if="playingList.map[s]"
            @click="removePlaying(s)"
            class="operation-icon operation-icon-3 iconfont icon-list-reomve"
          />
          <i
            v-if="!playingList.map[s]"
            @click="addPlaying(s)"
            class="operation-icon operation-icon-3 iconfont icon-list-add"
          />
          <i
            v-if="!!allSongs[s].url"
            @click="download(s)"
            class="operation-icon operation-icon-4 iconfont icon-download"
          />
          <i
            @click="playlistTracks(s, listId, 'del', 'DEL_SONG')"
            v-if="userList[allSongs[s].platform] && userList[allSongs[s].platform].mine && userList[allSongs[s].platform].mine[listId]"
            class="operation-icon operation-icon-5 iconfont icon-delete"
          />
        </div>
      </div>
      <div class="focus-btn" v-if="list.indexOf(playNow.aId) > -1" @click="scrollToPlayNow">
        <i class="iconfont icon-focus" />
      </div>
    </div>
  </div>
</template>

<script>
  import { getQueryFromUrl } from "../assets/utils/stringHelper";
  import {
    getPlaylist,
    likeMusic,
    download,
    collectPlaylist,
  } from "../assets/utils/request";
  import { mapGetters } from 'vuex';
  import Storage from "../assets/utils/Storage";
  import { handlePlayingList } from "../assets/utils/util";

  export default {
    name: "PlayListDetail",
    data() {
      return {
        id: getQueryFromUrl('id'),
        listId: '',
        search: '',
        list: [],
        listInfo: null,
        loading: true,
        platform: getQueryFromUrl('from') || '163',
        smallIndex: 0,
        bigIndex: 0,
        qqId: Storage.get('qqId'),
        showScrollTo: false,
      }
    },
    computed: {
      ...mapGetters({
        playingList: 'getPlayingList',
        userList: 'getUserList',
        qUserList: 'getQUserList',
        allList: 'getAllList',
        allSongs: 'getAllSongs',
        playNow: 'getPlaying',
        user: 'getUser',
        playingPercent: 'getPlayingPercent',
        favSongMap: 'getFavSongMap',
      })
    },
    watch: {
      allList() {
        this.searchList();
      },
      list() {
        this.$nextTick(this.getShowIndex);
      },
      search() {
        this.searchList();
      },
      $route(){
        this.platform = this.$route.query.from || '163';
        this.id = this.$route.query.id.replace(`${this.platform}_`, '');
        this.listId = `${this.platform}_${this.id}`;
        this.init();
      },
      playingList: {
        handler() {
          if (this.id === 'playing') {
            this.init();
          }
        },
        deep: true,
      },
    },
    created() {
      const { allList, id, userList, platform } = this;
      this.id = String(id).replace(`${platform}_`, '');
      this.listId = `${platform}_${this.id}`;
      this.list = allList[this.listId] || [];
      this.init();
    },
    methods: {
      async init() {
        const { id, platform, qUserList, list } = this;
        this.loading = false;
        if (id === 'playing') {
          this.listInfo = null;
          return this.list = this.playingList.trueList || [];
        }
        const listId = this.listId = `${platform}_${id}`;
        if (listId === `${platform}_daily`) {
          this.listInfo = null;
          return this.list = this.allList[listId] || [];
        }
        this.loading = true;
        const listInfo = await getPlaylist(id, platform);
        if (!listInfo) {
          return this.$message.error('获取歌单信息出错！');
        }
        this.listInfo = listInfo;
        this.songs = this.listInfo.songs;
        this.loading = false;
      },
      playListShow(playing) {
        const { allSongs, list, listId } = this;
        const { dispatch } = this.$store;
        const song = allSongs[list[0]];
        if (!song.url) {
          return;
        }
        if (playing) {
          dispatch('updatePlayNow', song);
          dispatch('updatePlayingList', { list, listId });
          dispatch('updatePlayingStatus', true);
        } else {
          dispatch('updatePlayingList', { list, more: true });
          this.$message.success('已添加到正在播放');
        }
      },
      downShow() {
        const { allSongs, list } = this;
        const songList = list.filter((id) => !!allSongs[id].url);
        if (!songList.length) {
          return this.$message.info('没有歌呢');
        }

        this.$confirm(`批量下载${songList.length}首歌曲？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message.info('为了防止服务器误封高频ip，批量下载一秒增加一个任务');
          songList.forEach((id, i) => {
            setTimeout(() => download(id), i * 1000);
          })
        });

      },
      searchList() {
        const { search, allList, listId, id, allSongs, platform } = this;
        const rex = search.replace(/\/|\s|\t|,|，|-|/g, '').toLowerCase();
        let rawList = [];
        switch (listId) {
          case `${platform}_playing`:
            rawList = this.playingList.trueList;
            break;
          case `${platform}_${id}`:
            rawList = this.allList[listId];
            break;
          default:
            rawList = allList[id];
            break;
        }
        rawList = rawList || [];
        if (!rex) {
          this.showScrollTo = rawList.indexOf(this.playNow.aId) !== -1;
          return this.list = rawList;
        }
        this.list = rawList.filter((s) => (
          `${allSongs[s].name}
          ${(allSongs[s].ar || []).map((a) => a.name)}
          ${allSongs[s].al.name}
          ${allSongs[s].name}
          ${allSongs[s].al.name}
          ${(allSongs[s].ar || []).map((a) => a.name)}
          ${allSongs[s].name}`
            .replace(/\s/g, '')
            .toLowerCase()
            .indexOf(rex) > -1
        ));
      },
      likeMusic,
      playlistTracks(tracks, pid, op, type, platform) {
        window.event.stopPropagation();
        this.$store.dispatch('setOperation', { data: { tracks, pid, op }, type, platform });
      },
      download,
      collectPlaylist,
      getShowIndex() {
        const dom = document.getElementsByClassName('list-detail-container')[0];
        const smallHeight = Math.max(dom.scrollTop - 500, 0);
        this.smallIndex = smallHeight / 71;
        const bigHeight = dom.clientHeight + dom.scrollTop + 300;
        this.bigIndex = bigHeight / 71;
      },
      scrollToPlayNow() {
        const domP = document.getElementsByClassName('song-item played')[0];
        const domL = document.getElementsByClassName('song-list')[0];
        if (domP) {
          document.getElementsByClassName('list-detail-container')[0].scrollTo(0, domP.offsetTop + domL.offsetTop);
        }
      },
      ...handlePlayingList,
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

          .creator-name:hover {
            text-decoration: underline;
          }

          &:hover {
            opacity: 1;
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
        width: calc(100% - 200px);
        margin-left: 0;

        &::-webkit-input-placeholder {
          color: rgba(255,255,255,0.5);
        }
      }
    }

    .song-list {
      padding-left: 20px;
      padding-right: 20px;
      position: relative;

      .focus-btn {
        position: fixed;
        bottom: 120px;
        right: 40px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #F23C3C;
        border: 2px solid #F23C3C;
        opacity: 0.3;
        font-size: 0;
        cursor: pointer;
        box-shadow: 0 0 20px #333;
        transition: 0.3s;
        overflow: hidden;
        z-index: 10;
        text-align: center;

        .iconfont {
          font-size: 28px;
          color: #fff;
          line-height: 50px;
        }

        &:hover {
          opacity: 0.7;
        }

      }

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

        &.hidden {
          span, img, div {
            display: none !important;
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

          @for $i from 1 through 7 {
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