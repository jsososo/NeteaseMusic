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
        id: this.$route.query.id,
        list: [],
        listInfo: null,
        loading: true,
        platform: this.$route.query.from || '163',
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
      }),
      listId() {
        return `${this.platform}_${this.id}`
      }
    },
    watch: {
      allList(v) {
        const { listId } = this;
        this.list = v[listId] || this.list;
      },
      $route(){
        this.platform = this.$route.query.from || '163';
        this.id = this.$route.query.id.replace(`${this.platform}_`, '');
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
    mounted() {
      const { id, platform } = this;
      this.id = String(id).replace(`${platform}_`, '');
      this.init();
    },
    methods: {
      async init() {
        const { id, platform, allList, listId } = this;
        this.loading = false;
        if (id === 'playing') {
          this.listInfo = null;
          return this.list = this.playingList.trueList || [];
        }
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
    }
  }
</script>

<style lang="scss" scoped>
</style>