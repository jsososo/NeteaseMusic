<template>
  <div class="mb_20 list-top-container">
    <div v-if="!selected.len" class="inline-block top-box">
      <el-button :class="`key-select-btn ${searchKey === '列表内' && 'active'}`" @click="changeSearchKey('列表内')">
        列表内
      </el-button>
      <el-button :class="`key-select-btn ${searchKey === '网易云' && 'active'}`" @click="changeSearchKey('网易云')">
        网易云
      </el-button>
      <!--<el-button :class="`key-select-btn ${searchKey === '电台' && 'active'}`" @click="changeSearchKey('电台')">-->
        <!--电台-->
      <!--</el-button>-->
      <input :disabled="searchKey === '电台'" type="text" :class="`search-input ${searchKey === '电台' && 'half-hide'}`" placeholder="找点什么吧" v-model="search">
    </div>
    <div v-if="selected.len" class="inline-block top-box">
      <div class="top-box-button" @click="selectAll">全 选</div>
      <div class="top-box-button" @click="cancel">取消</div>
      <span class="pr_15">批量：{{selected.len}}/{{allLength}}</span>
      <div class="top-box-button" @click="downAll">下载</div>
      <div class="top-box-button" @click="addAll(true)">添加</div>
      <div class="top-box-button" @click="addAll(false)" v-if="searchKey === '列表内'">删除</div>
    </div>
    <Avatar />
  </div>
</template>

<script>
  import Avatar from '@/components/Avatar';
  import request, { searchReq } from '../assets/utils/request';
  import { mapGetters } from 'vuex';
  import { download } from "../assets/utils/stringHelper";

  export default {
    name: "Search",
    components: { Avatar },
    data() {
      return {
        search: '',
        allLength: 0,
      }
    },
    computed: {
      ...mapGetters({
        allSongs: 'getAllSongs',
        searchKey: 'getSearchKey',
        selected: 'getSelectedSongs',
        showList: 'getShowList',
        radioInfo: 'getRadioInfo',
        searchQuery: 'getSearchQuery',
      }),
    },
    watch: {
      showList(v) {
        this.allLength = v.filter(i => i.mediamid).length;
        this.$store.dispatch('updateSelectedSongs',
          {
            val: {},
            len: 0,
          });
      },
      search(v) {
        if (this.searchKey !== '网易云') {
          const data = {
            search: v.replace(/\s|,|，|\//g, ''),
            isAll: this.searchKey === '站内',
          };
          this.$store.dispatch('searchMusic', data);
        } else {
          if (v) {
            searchReq(v);
          } else {
            this.$store.dispatch('updateShowList', []);
          }
        }
      },
    },
    methods: {
      // 修改搜索范围
      changeSearchKey(v) {
        switch (v) {
          case '网易云':
            searchReq(this.searchQuery.val);
            break;
          case '列表内':
            this.$store.dispatch('searchMusic', {
              search: this.search.replace(/\s|,|，|\//g, ''),
              isAll: v === '站内',
            });
            break;
          case '电台':
            this.$store.dispatch('updateRadioInfo', { show: true });
            break;
          default: break;
        }
        this.$store.dispatch('changeSearchKey', v);
      },
      // 搜索音乐
      search163Music(v) {
        this.$store.dispatch('changeSearchQuery', { val: v, pageNo: 1, total: 0, loading: true });
        request({ api: '163_SEARCH', data: { keywords: v } })
          .then((res) => this.$store.dispatch('query163List', res.result));
      },
      // 批量下载
      downAll() {
        if (!this.selected.len) {
          return;
        }
        const list = this.selected.val;
        const allSongs = this.allSongs;
        Object.keys(list).forEach(k => list[k] && download(allSongs[k]));
      },
      // 全选
      selectAll() {
        const { selected, showList } = this;
        showList.forEach(o => {
          if (o.mediamid && !selected.val[o.objectId]) {
            selected.val[o.objectId] = true;
            selected.len++;
          }
        });
        this.$store.dispatch('updateSelectedSongs', selected);
      },
      // 添加或删除全部
      addAll(add) {
        if (!this.selected.len) {
          return;
        }
        const song = {
          songid: [],
          songmid: [],
        };
        const list = this.selected.val;
        const allSongs = this.allSongs;
        Object.keys(list).forEach(k => {
          if (list[k]) {
            song.songid.push(allSongs[k].songid);
            song.songmid.push(allSongs[k].songmid);
          }
        });
        song.songid = song.songid.join(',');
        song.songmid = song.songmid.join(',');
        this.$store.dispatch('updateAdd2DirInfo', { song, add })
      },
      cancel() {
        this.$store.dispatch('updateSelectedSongs',
          {
            val: {},
            len: 0,
          });
      }
    }
  }
</script>

<style lang="scss">
  .list-top-container {
    min-width: 536px;

    .top-box {
      min-width: 464px;
      color: #fff;

      .top-box-button {
        display: inline-block;
        padding: 5px 10px;
        border: 1px solid #fff;
        border-radius: 5px;
        opacity: 0.6;
        cursor: pointer;
        transition: 0.3s;
        margin-right: 8px;

        &:hover {
          opacity: 0.8;
        }
      }

      .el-button+.el-button {
        margin-left: -1px;
      }
    }

    .half-hide {
      opacity: 0.5;
    }

    .key-select-btn {
      background: transparent !important;
      color: rgba(255,255,255,0.5) !important;
      border: 1px rgba(255,255,255,0.5) dashed !important;
      outline: none;
      box-shadow: none !important;
      margin-left: 0;

      &.active {
        color: white !important;
        border: 1px solid white !important;
      }
    }

    .search-input {
      background: transparent !important;
      border: transparent;
      border-bottom: 1px solid rgba(255,255,255, 0.5) !important;
      color: white;
      font-size: 20px;
      outline: none !important;
      width: 245px;
      vertical-align: -5px;
      margin-left: 20px;

      &::-webkit-input-placeholder {
        color: rgba(255,255,255,0.5);
      }
    }
  }
</style>