<template>
  <PlayListDetail
    :loading="loading"
    :listInfo="listInfo"
    :id="id"
    :trueList="list"
    :platform="$route.query.from"
  />
</template>

<script>
  import PlayListDetail from "../components/PlayListDetail";
  import { getQueryFromUrl } from "../assets/utils/stringHelper";
  import { getPlaylist } from "../assets/utils/request";
  import { mapGetters } from "vuex";

  export default {
    name: "PlayListDetailPage",
    components: { PlayListDetail },
    data() {
      return {
        listId: '',
        id: getQueryFromUrl('id'),
        // search: '',
        list: [],
        listInfo: null,
        loading: true,
        platform: getQueryFromUrl('from') || '163',
        // smallIndex: 0,
        // bigIndex: 0,
        // qqId: Storage.get('qqId'),
        // showScrollTo: false,
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
      allList(v) {
        const { listId } = this;
        this.list = v[listId] || this.list;
      },
      // list() {
      //   this.$nextTick(this.getShowIndex);
      // },
      // search() {
      //   this.searchList();
      // },
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
      this.init();
    },
    methods: {
      async init() {
        const { id, platform, allList } = this;
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
        this.list = allList[listId] || [];
        this.loading = true;
        const listInfo = await getPlaylist(id, platform);
        if (!listInfo) {
          return this.$message.error('获取歌单信息出错！');
        }
        this.listInfo = listInfo;
        this.loading = false;
      },
      // playListShow(playing) {
      //   const { allSongs, list, listId } = this;
      //   const { dispatch } = this.$store;
      //   const song = allSongs[list[0]];
      //   if (!song.url) {
      //     return;
      //   }
      //   if (playing) {
      //     dispatch('updatePlayNow', song);
      //     dispatch('updatePlayingList', { list, listId });
      //     dispatch('updatePlayingStatus', true);
      //   } else {
      //     dispatch('updatePlayingList', { list, more: true });
      //     this.$message.success('已添加到正在播放');
      //   }
      // },
      // downShow() {
      //   const { allSongs, list } = this;
      //   const songList = list.filter((id) => !!allSongs[id].url);
      //   if (!songList.length) {
      //     return this.$message.info('没有歌呢');
      //   }
      //
      //   this.$confirm(`批量下载${songList.length}首歌曲？`, '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      //     this.$message.info('为了防止服务器误封高频ip，批量下载一秒增加一个任务');
      //     songList.forEach((id, i) => {
      //       setTimeout(() => download(id), i * 1000);
      //     })
      //   });
      //
      // },
      // searchList() {
      //   const { search, allList, listId, id, allSongs, platform } = this;
      //   const rex = search.replace(/\/|\s|\t|,|，|-|/g, '').toLowerCase();
      //   let rawList = [];
      //   switch (listId) {
      //     case `${platform}_playing`:
      //       rawList = this.playingList.trueList;
      //       break;
      //     case `${platform}_${id}`:
      //       rawList = this.allList[listId];
      //       break;
      //     default:
      //       rawList = allList[id];
      //       break;
      //   }
      //   rawList = rawList || [];
      //   if (!rex) {
      //     this.showScrollTo = rawList.indexOf(this.playNow.aId) !== -1;
      //     return this.list = rawList;
      //   }
      //   this.list = rawList.filter((s) => (
      //     `${allSongs[s].name}
      //     ${(allSongs[s].ar || []).map((a) => a.name)}
      //     ${allSongs[s].al.name}
      //     ${allSongs[s].name}
      //     ${allSongs[s].al.name}
      //     ${(allSongs[s].ar || []).map((a) => a.name)}
      //     ${allSongs[s].name}`
      //       .replace(/\s/g, '')
      //       .toLowerCase()
      //       .indexOf(rex) > -1
      //   ));
      // },
      // likeMusic,
      // playlistTracks(tracks, pid, op, type, platform) {
      //   window.event.stopPropagation();
      //   this.$store.dispatch('setOperation', { data: { tracks, pid, op }, type, platform });
      // },
      // download,
      // collectPlaylist,
      // getShowIndex() {
      //   const dom = document.getElementsByClassName('list-detail-container')[0];
      //   const smallHeight = Math.max(dom.scrollTop - 500, 0);
      //   this.smallIndex = Math.floor(smallHeight / 71);
      //   const bigHeight = dom.clientHeight + dom.scrollTop + 300;
      //   this.bigIndex = Math.floor(bigHeight / 71);
      // },
      // scrollToPlayNow() {
      //   const { list, playNow } = this;
      //   const index = this.list.findIndex((v) => v === playNow.aId);
      //   const domL = document.getElementsByClassName('song-list')[0];
      //   if (index > -1) {
      //     document.getElementsByClassName('list-detail-container')[0].scrollTo(0, index * 71 + domL.offsetTop);
      //   }
      // },
      // ...handlePlayingList,
    }
  }
</script>

<style lang="scss" scoped>
</style>