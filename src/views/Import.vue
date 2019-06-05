<template>
  <div class="ml_20" id="import">
    <div class="mt_20">
      <a href="#/">
        <i class="back-icon el-icon-arrow-left"></i>
      </a>
      <div class="select-plate">
        <el-select v-model="selectPlate">
          <el-option
            v-for="item in plates"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <input class="input-url" @change="inputListUrl" v-model="inputUrl" placeholder="粘贴分享链接或歌单id">

      <div class="get-progress inline-block" v-if="songList.length">获取进度：
        <div class="inline-block percent-container">
          <div :style="`width:${percent}%`" class="percent-inner"></div>
        </div>
        {{getNum}}/{{songList.length}},  找到啦：{{successNum}}， 找不到：{{errorNum}}
      </div>
    </div>
    <div v-if="songList.length">
      <div>
        <div class="mt_15 mb_20 ml_30" style="color: rgba(255,255,255,0.8)">
          <el-button @click="selectAll" size="medium">全选</el-button>
          <span class="pl_20">已选择：{{selectedNum}}</span>
          <el-button @click="downAll" class="ml_20" size="medium">批量下载</el-button>
          <span style="color: #fff; opacity: 0.8;font-size: 12px;padding-left: 30px;">
            由于担心频繁的接口调用引起腾讯注意，所以限制为1秒一次请求，请耐心等待
          </span>
          <el-button @click="likeAll" class="ml_20" size="medium">批量添加</el-button>
        </div>
        <div class="list-container">
          <div v-for="(s, i) in songList" :class="`song-list-item song-list-item-${i} ${s.selected ? 'selected' : ''}`" :key="s.id">
            <el-checkbox style="vertical-align: top;" @change="selectedItem(s, i)" class="mt_10 ml_10" :value="s.selected">
              <div class="song-info">
                {{s.artist}}-{{s.name}}
              </div>
            </el-checkbox>
            <div class="inline-block song-info mt_10" v-if="s.qqInfo">{{s.qqInfo.artist}}-{{s.qqInfo.title}}</div>
            <div class="inline-block mt_10 pt_10 ml_20" v-if="s.qqInfo">
              <!-- 下载 -->
              <i class="iconfont icon-xiazai" @click="down(s.qqInfo)" />
              <!-- 喜欢 -->
              <i
                @click="add2Dir(s.qqInfo, { dirid: favList.id, dissid: favList.disstid }, !Boolean(favList[s.qqInfo.songmid]))"
                :class="favList[s.qqInfo.songmid] ? 'iconfont icon-xihuan iconfont' : 'iconfont icon-weixihuan'">
              </i>
              <i class="iconfont icon-tianjia" @click="add2Dir(s.qqInfo, null, true)"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { getQueryFromUrl, getSongUrl, download } from "../assets/utils/stringHelper";
  import Num from '../assets/utils/num';
  import request from "../assets/utils/request";

  export default {
    name: "import",
    data() {
      return {
        listId: '',
        inputUrl: '',
        selectPlate: '163',
        plates: [
          {
            label: '网易云',
            value: '163',
          },
        ],
        songList: [],
        songVal: {},
        getNum: 0,
        percent: 0,
        successNum: 0,
        errorNum: 0,
        selectedNum: 0,
        selectedVal: {},
      }
    },
    computed: {
      ...mapGetters({
        favList: 'getFavList',
        tagInfo: 'getTagInfo',
      }),
    },
    watch: {
      getNum(v) {
        this.percent = Num(v / this.songList.length * 100) ;
      }
    },
    methods: {
      inputListUrl() {
        const keyMap = {
          163: 'id'
        };
        const plate = this.selectPlate;
        const v = this.inputUrl;
        const id = getQueryFromUrl(keyMap[plate], v);
        this.listId = id || v;
        this[`get${plate}List`]();
      },
      get163List() {
        const errCb = () => this.$message.error('好好想想你自己做错了什么');
        request.qq({
          apiName: '163',
          dataType: 'json',
          data: {
            type: 'playlist',
            id: this.listId,
          }
        }, (res) => {
          if (res.code === 200) {
            this.songList = res.result.tracks.map((item, index) => {
              const song = {
                name: item.name,
                artist: item.artists.map(a => a.name).join('/'),
                desc: item.alias && (item.alias[0] || ''),
                album: item.album.name,
              };
              setTimeout(() => this.getSong(song, index), 1000 * index);
              return song;
            });
          } else {
            errCb();
          }
        }, errCb)
      },
      // 查询qq音乐对应的歌曲
      getSong(s, i) {
        request.qq({
          apiName: 'QQ_SEARCH',
          data: { p: 1, n: 1, w: `${s.name} ${s.artist} ${s.album}`, cr: 1, aggr: 1 },
        }, (res) => {
          this.getNum++;
          try {
            var result = res.data.song.list;
            if (result.length) {
              const item = result[0];
              const sItem = {
                from: 'qq',
                album: item.albumname,
                albummid: item.albummid,
                title: item.songname,
                songmid: item.songmid,
                artist: item.singer.map(s => s.name).join('/'),
                objectId: item.songmid,
                mediamid: item.size128 && item.media_mid, // 避免有的歌曲有id没有音乐
                cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${item.albummid}.jpg`,
                size128: item.size128,
                size320: item.size320,
                sizeape: item.sizeape,
                sizeflac: item.sizeflac,
                songid: item.songid,
              };
              if (sItem.mediamid && sItem.size128) {
                this.successNum++;
                sItem.downUrl = getSongUrl(sItem, true);
                this.songList[i].qqInfo = sItem;
              } else {
                this.errorNum++;
              }
            } else {
              this.errorNum++;
            }
          } catch (err) {
            this.errorNum++;
          }
        })
      },
      // 全选
      selectAll() {
        this.songList.forEach((item, index) => !item.selected && this.selectedItem(item, index));
      },
      // 选择
      selectedItem(item, index) {
        if (item.qqInfo && item.qqInfo.downUrl) {
          item.selected = !item.selected;
          this.selectedNum += (item.selected ? 1 : -1);
          this.selectedVal[index] = item.selected
        }
      },
      down: download,
      downAll() {
        this.selectedNum &&
        Object.keys(this.selectedVal).forEach(i => this.selectedVal[i] && download(this.songList[i].qqInfo));
      },
      add2Dir(song, dir, add) {
        this.$store.dispatch('updateAdd2DirInfo', { song, dir, add })
      },
      likeAll() {
        const { selectedNum, selectedVal, songList } = this;
        const song = {
          songmid: [],
          songid: [],
        };
        if (selectedNum) {
          Object.keys(selectedVal).forEach(i => {
            if (selectedVal[i]) {
              song.songmid.push(songList[i].qqInfo.songmid);
              song.songid.push(songList[i].qqInfo.songid);
            }
          })
        }
        song.songmid = song.songmid.join(',');
        song.songid = song.songid.join(',');
        this.add2Dir(song, null, true);
      }
    }
  }
</script>

<style lang="scss">
  #import {
    a {
      color: #fff;
    }
    .back-icon {
      font-size: 24px;
      color: white;
      font-weight: bold !important;
      vertical-align: middle;
    }
    .select-plate {
      margin-left: 30px;
      vertical-align: middle;
      display: inline-block;
      width: 130px;
    }
    .el-select.el-select--small .el-input__inner {
      background: transparent !important;
      border-color: #fff !important;
      color: #fff !important;
    }
    .input-url {
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(255,255,255,0.7);
      font-size: 18px;
      line-height: 32px;
      margin-left: 30px;
      width: 250px;
      display: inline;
      outline: none;
      color: #fff;
      &::-webkit-input-placeholder {
        color: rgba(255,255,255,0.5);
      }
    }
    .song-list-item {
      background: transparent;
      transition: 0.4s;

      .el-checkbox__input {
        vertical-align: 12px;
      }

      .song-info {
        font-size: 18px;
        line-height: 18px;
        display: inline-block;
        padding: 10px;
        width: 400px;
        word-break: break-all;
        color: #fff;
        opacity: 0.5;
        transition: 0.4s;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover {
        background: rgba(255,255,255,0.2);
      }
    }
    .list-container .iconfont {
      cursor: pointer;
      color: #fff;
      opacity: 0.8;
      display: inline-block;
      vertical-align: middle;
      margin: 0 10px;
      padding: 0 5px;
    }
    .selected .song-info {
      opacity: 0.9 !important;
    }
    .get-progress {
      color: rgba(255,255,255,0.8);
      line-height: 32px;
      margin-top: 10px;
      margin-left: 20px;

      .percent-container {
        border: 1px solid rgba(255,255,255,0.7);
        border-radius: 4px;
        height: 30px;
        width: 200px;
        position: relative;
        overflow: hidden;

        .percent-inner {
          position: relative;
          background: rgba(255,255,255,0.7);
          height: 32px;
        }
      }
    }
    .el-button {
      background: transparent !important;
      border: 1px solid #fff !important;
      color: #fff !important;
      opacity: 0.7;
      margin-left: 20px;
    }
    .el-checkbox__inner {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.6) !important;
      transform: scale(1.25);
    }
    .el-select-dropdown {
      background: transparent !important;
      &.el-popper {
        background: transparent !important;
        color: #fff !important;

        .popper__arrow:after {
          border-bottom: transparent !important;
        }
        .el-select-dropdown__item {
          color: #fff !important;
          background: transparent !important;
          font-weight: normal;

          &.hover {
            background: transparent !important;
            font-weight: bold;
          }

          &.selected {
            background: rgba(255, 255, 255, 0.3) !important;
          }
        }
      }
    }
  }
</style>