<template>
  <div :class="`song-list ${selected.len ? 'selecting' : ''}`" @scroll="onScroll">
    <div :class="allSongs[s.id].url ? (playNow.id === s.id ? 'song-item playing' : 'song-item') : 'song-item song-empty'"
         v-for="(s, i) in showList"
         :key="`${s.id}-${i}`"
    >
      <span class="song-order" @click="playMusic(s.id)">{{i + 1}}</span>
      <!--<span class="song-checkbox" @click="select(s.id)">-->
        <!--<el-checkbox :value="selected.val[s.id]"></el-checkbox>-->
      <!--</span>-->
      <span class="song-title" @click="playMusic(s.id)">{{s.name}}</span>
      <span class="song-artist">
        <span class="song-artist-txt" @click="playMusic(s.id)">{{(allSongs[s.id].ar || []).map((a) => a.name).join('/')}}</span>
        <span class="song-operation">
          <!--<span-->
            <!--@click="like(s, { dirid: favList.id, dissid: favList.disstid }, !Boolean(favList[s.songmid]), true)"-->
            <!--:class="favList[s.songmid] ? 'iconfont icon-xihuan iconfont' : 'iconfont icon-weixihuan'">-->
          <!--</span>-->
          <!--<span @click="down(s)" v-if="s.mediamid" class="iconfont icon-xiazai" style="font-size: 15px;vertical-align: 2px;" />-->
          <!--<span class="iconfont icon-tianjia" style="font-size: 14px;vertical-align: 1px;" @click="like(s)"></span>-->
          <!--<el-popover-->
            <!--v-if="!!s.size128"-->
            <!--placement="left"-->
            <!--trigger="hover"-->
            <!--@show="showDownQr(s.songmid)"-->
            <!--@hide="showDownQr('', s.songmid)"-->
            <!--width="100">-->
            <!--<div style="width: 100px;height: 100px;text-align: center;">-->
              <!--<Qr v-if="showQr === s.songmid" :value="`http://music.jsososo.com/#/m/d/${downUrl(s)}`" size="100" level="L"/>-->
            <!--</div>-->
            <!--<span slot="reference" class="iconfont icon-qr" style="font-size: 14px;vertical-align: 1px;"></span>-->
          <!--</el-popover>-->
          <!--<span v-if="searchKey === '列表内'" class="iconfont icon-shanchu" style="font-size: 18px;" @click="like(s, null, false)"></span>-->
        </span>
      </span>
    </div>
    <div class="empty-status" v-if="showList.length === 0">空空如也！</div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { download, getSongUrl, changeUrlQuery } from "../assets/utils/stringHelper";
  import request, { searchReq } from '../assets/utils/request';
  import Qr from 'qrcode.vue';
  import Storage from '../assets/utils/Storage';
  import $ from 'jquery';

  export default {
    name: "SongList",
    components: { Qr },
    props: {
      isSys: Boolean,
      tag: String,
      hideHeader: Boolean,
    },
    data() {
      return {
        showQr: '',
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        showList: 'getShowList',
        allSongs: 'getAllSongs',
        favList: 'getFavList',
        tagInfo: 'getTagInfo',
        selected: 'getSelectedSongs',
        searchKey: 'getSearchKey',
        radioInfo: 'getRadioInfo',
        searchQuery: 'getSearchQuery',
      }),
    },
    methods: {
      like(song, dir, add = true, fav) {
        this.$store.dispatch('updateAdd2DirInfo', { song, dir, add, fav})
      },
      playMusic(id) {
        const pDom = document.getElementById('m-player');
        const { radioInfo } = this;
        const dispatch = this.$store.dispatch;
        if (!this.allSongs[id].url) {
          this.$message.info('网易云暂无版权～');
          return;
        }
        // 删除电台信息
        radioInfo.playing.radioId = '';
        radioInfo.selected.radioId = '';
        dispatch('updateRadioInfo', radioInfo);


        pDom.play();
        if (this.playNow.id !== id) {
          dispatch('updatePlayNow', this.allSongs[id]);
        } else {
          pDom.currentTime = 0;
        }
        // 播放状态
        dispatch('updatePlayingStatus', true);
      },
      down: download,
      downUrl(v) {
        const info = getSongUrl(v, true);
        const music = changeUrlQuery({}, info[0], false).replace(Storage.get('murl'), '').replace('?', '');
        return `?u=${music}&n=${encodeURI(info[1])}&c=${encodeURI(info[3])}`;
      },
      showDownQr(v, old) {
        if (old && this.showQr !== old) {
          return;
        }
        this.showQr = v;
      },
      select(v) {
        window.event.preventDefault();
        const { selected } = this;
        selected.val[v] = !selected.val[v];
        selected.len += selected.val[v] ? 1 : -1;
        this.$store.dispatch('updateSelectedSongs', selected);
      },
      onScroll(e) {
        const { searchQuery, searchKey } = this;
        if (searchKey !== '网易云') {
          return;
        }
        const { pageNo, total, val, loading } = searchQuery;
        const el = $('.song-list');
        const viewH = el.height();//可见高度
        const contentH = el.get(0).scrollHeight;//内容高度
        const scrollTop = el.scrollTop();//滚动高度
        if (contentH - viewH - scrollTop < 150 && pageNo * 30 < total && !loading) {
          this.$store.dispatch('changeSearchQuery', { val, pageNo, total, loading: true });
          searchReq(val, 1, pageNo + 1);
        }
      }
    }
  }
</script>

<style lang="scss">
  /*.el-popover {*/
    /*min-width: 10px !important;*/
  /*}*/
  /*.song-list {*/
    /*display: inline-block;*/
    /*height: calc(100vh - 200px);*/
    /*overflow-y: auto;*/
    /*overflow-x: hidden;*/
    /*width: 550px;*/
    /*margin-top: 10px;*/
    /*margin-right: 20px;*/

    /*&.selecting {*/
      /*.song-order {*/
        /*!*display: none !important;*!*/
      /*}*/
      /*.song-checkbox {*/
        /*display: inline-block !important;*/
      /*}*/
    /*}*/


  /*}*/

  /*.empty-status {*/
    /*color: White;*/
    /*font-size: 20px;*/
    /*text-align: center;*/
    /*line-height: 30px;*/
    /*padding: 30px;*/
  /*}*/
  /*.song-item {*/
    /*width: 100%;*/
    /*transition: 0.5s;*/
    /*border-bottom: 1px solid rgba(255,255,255,0.2);*/
    /*text-overflow: ellipsis;*/
    /*cursor: default;*/

    /*&.playing {*/
      /*background: rgba(255,255,255,0.2);*/
      /*border-bottom: 1px solid rgba(255,255,255,0.9);*/
    /*}*/

    /*&.song-empty {*/
      /*opacity: 0.55;*/

      /*.song-order {*/
        /*display: inline-block !important;*/
      /*}*/
      /*.song-checkbox {*/
        /*display: none !important;*/
      /*}*/
      /*&:hover {*/
        /*.song-artist-txt {*/
          /*opacity: 1 !important;*/
        /*}*/
        /*.song-operation {*/
          /*display: none !important;*/
        /*}*/
      /*}*/
    /*}*/

    /*.song-checkbox {*/
      /*display: none;*/
      /*width: 10%;*/
      /*padding: 8px;*/
      /*box-sizing: border-box;*/

      /*.el-checkbox__inner {*/
        /*background: transparent !important;*/
        /*border: 1px solid rgba(255,255,255,0.6) !important;*/
        /*transform: scale(1.25);*/
      /*}*/
    /*}*/

    /*&:hover {*/
      /*background: rgba(255,255,255,0.2);*/

      /*.song-order {*/
        /*!*display: none;*!*/
      /*}*/

      /*.song-checkbox {*/
        /*display: inline-block;*/
      /*}*/

      /*.song-artist {*/
        /*.song-artist-txt {*/
          /*!*opacity: 0;*!*/
        /*}*/
        /*.song-operation {*/
          /*display: inline-block;*/
          /*opacity: 1;*/
        /*}*/
      /*}*/
    /*}*/
    /*.song-order, .song-artist, .song-title {*/
      /*display: inline-block;*/
      /*padding: 10px;*/
      /*box-sizing: border-box;*/
      /*color: #eee;*/
      /*font-size: 14px;*/
      /*vertical-align: top;*/
      /*word-wrap: break-word;*/
    /*}*/
    /*.song-order {*/
      /*width: 10%*/
    /*}*/
    /*.song-title {*/
      /*width: 55%;*/
    /*}*/
    /*.song-artist {*/
      /*width: 35%;*/
      /*position: relative;*/

      /*.song-artist-txt {*/
        /*display: inline-block;*/
        /*opacity: 1;*/
        /*padding: 0;*/
      /*}*/
      /*.song-operation {*/
        /*position: absolute;*/
        /*top: 10px;*/
        /*left: 10px;*/
        /*display: none;*/
        /*vertical-align: top;*/
        /*padding: 0;*/
        /*opacity: 1;*/
        /*transition: 0.5s;*/

        /*.iconfont {*/
          /*padding: 0;*/
          /*margin-right: 10px;*/
          /*font-size: 18px;*/
          /*cursor: pointer;*/

          /*&.icon-tianjia {*/
            /*font-size: 17px;*/
          /*}*/
        /*}*/
      /*}*/
    /*}*/
  /*}*/
</style>