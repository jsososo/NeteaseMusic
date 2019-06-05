<!-- 这就是一个用来添加到歌单到中间层 -->
<template>
  <div>
    <!-- 下载相关的设置弹窗 -->
    <el-dialog
      width="600px"
      :visible="Boolean(downSettingStr)"
      :modal-append-to-body="true"
      :append-to-body="true"
      :before-close="() => $store.dispatch('updateDownSettingDialog', '')"
    >
      <div>
        <div class="ft_16 mb_20 fc_666">{{downSettingStr}}</div>
        <div class="mb_10">
          <div class="inline-block" style="width: 100px;">
            仅下载高品质
          </div>
          <div class="inline-block" style="width: 460px;">
            <div><el-switch v-model="downSetting.onlyHigh" /></div>
            <div>
              <span v-if="downSetting.onlyHigh" class="fc_999">当选择优先下 无损 \ 320k 时，不会下载 320k,128k \ 128k 的音乐</span>
              <span v-if="!downSetting.onlyHigh" class="fc_999">当没有优先下的音频时会向下寻找可下载的音乐</span>
            </div>
          </div>
        </div>
        <div class="mb_10">
          <div class="inline-block" style="width: 100px;">
            重复下载
          </div>
          <div class="inline-block" style="width: 460px;">
            <div><el-switch v-model="downSetting.downRepeat" /></div>
            <div>
              <span v-if="downSetting.downRepeat" class="fc_999">会一直重复下载</span>
              <span v-if="!downSetting.downRepeat" class="fc_999">列表内下载成功过的不会重复下载</span>
            </div>
          </div>
        </div>
        <div class="mb_10">
          <div class="inline-block" style="width: 90px;line-height: 32px">优先下载</div>
          <el-select style="width: 200px;margin-left: 10px" v-model="downSize">
            <el-option
              v-for="item in sizeArr"
              v-if="!item.type || item.type === 'down'"
              :key="item.val"
              :label="item.label"
              :value="item.val">
            </el-option>
          </el-select>
        </div>
        <div class="inline-block mb_10 mt_10" v-if="downSize === 'high'">
          <div class="inline-block" style="width: 100px;">无损格式：</div>
          <el-radio-group v-model="downHigh">
            <el-radio label="sizeflac">flac</el-radio>
            <el-radio label="sizeape">ape</el-radio>
          </el-radio-group>
        </div>
        <div class="text-right mt_5 mr_10">
          <el-button type="primary" size="medium" class="inline" @click="$store.dispatch('updateDownSettingDialog', '')">确定</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 不管出现什么错误都去怪cookie -->
    <el-dialog
      width="650px"
      :visible="showTokenDialog"
      :modal-append-to-body="true"
      :append-to-body="true"
      :before-close="() => showTokenDialog = false"
    >
      <div style="width: 600px; text-align: left">
        <el-alert
          title="添加到歌单到功能需要获取 y.qq.com 域名下的token值，您可能还未获取或已过期，本站不会做收集，只会将数据存于您本地"
          type="info"
          show-icon>
        </el-alert>
        <div class="pl_20">
          <div class="mt_10">
            1、登陆QQ音乐官网： <a href="https://y.qq.com" target="_blank">https://y.qq.com</a>
          </div>
          <div class="mt_10">
            2、打开开发者模式：（<code>option+command+i</code> 或 <code>ctrl+shift+i</code>）
          </div>
          <div class="mt_10">
            3、将下面内容粘贴并敲下回车：<code>console.log(document.cookie)</code>
          </div>
          <div class="mt_10">
            4、粘贴进去就ok啦！<el-input style="width: 200px;margin-left: 10px" v-model="inputCookie"/>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 添加时的选择歌单 -->
    <el-dialog
      width="260px"
      :visible="showChooseTag"
      :modal-append-to-body="true"
      :append-to-body="true"
      :before-close="() => showChooseTag = false"
    >
      <div class="choose-tag-list">
        <div
          :class="`choose-tag-item ${selectedTag.dirid === item.dirid ? 'selected' : ''}`"
          v-for="(item) in tags"
          @click="selectedTag = item"
          :key="item.dirid">
          {{item.title}}
        </div>
      </div>
      <el-button
        :disabled="!selectedTag.dirid"
        type="primary"
        size="medium"
        style="width: 220px;"
        @click="handleAddInfo({...add2DirInfo, add: true, dir: selectedTag})"
        class="mt_15">
        添加到：{{selectedTag.title}}
      </el-button>
    </el-dialog>

    <!-- 删除的二次确认 -->
    <el-dialog
      width="300px"
      :visible="showDelConfirm"
      :modal-append-to-body="true"
      :append-to-body="true"
      :before-close="() => showDelConfirm = false"
    >
      <div style="min-height: 60px">
        <div class="ft_18 pl_10">确定删除？</div>
        <div class="pull-right pt_15">
          <el-button @click="showDelConfirm = false">缓缓</el-button>
          <el-button type="danger" @click="handleAddInfo({ ...add2DirInfo, dir: tagInfo.selected })">确定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { getQueryFromUrl } from "../assets/utils/stringHelper";
  import request from '../assets/utils/request';
  import Storage from '../assets/utils/Storage';

  export default {
    name: "AddToDir",
    data() {
      return {
        showTokenDialog: false,
        showChooseTag: false,
        showDelConfirm: false,
        inputCookie: '',
        selectedTag: {},
        downSetting: {
          onlyHigh: 0,
          downRepeat: 0,
        },
        downSize: Storage.get('down_size'),
        downHigh: Storage.get('down_high'),
        sizeArr: [
          { label: '128k', val: 'size128' },
          { label: '320k', val: 'size320' },
          // { label: '无损ape', val: 'sizeape' },
          { label: '无损', val: 'sizeflac', type: 'listen' },
          { label: '无损', val: 'high', type: 'down' },
        ],
      }
    },
    watch: {
      inputCookie(v) {
        document.cookie = v;
        const c = getQueryFromUrl(null, `?${v.replace(/;\s/g, '&')}`);
        const token = c.p_skey || c.skey || c.p_lskey || c.lskey || '';
        if (!token) {
          this.$message.error('你肯定粘错了东西～');
        } else {
          // qq音乐那里扒来的转码方法
          const f = (e) => {
            let n = 5381;
            for (let o = 0, t = e.length; t > o; ++o)
              n += (n << 5) + e.charCodeAt(o);
            return 2147483647 & n;
          };
          Storage.set('qy_token', f(token));
          this.$message.success('ok！');
        }
      },
      // 别的组件想要增删歌单
      add2DirInfo(data) {
        const { add, fav } = data;
        if (!add && !fav) {
          this.showDelConfirm = true;
          return;
        }
        this.handleAddInfo(data);
      },
      downSettingStr(v) {
        if (v) {
          this.downSetting = {
            onlyHigh: Boolean(Number(Storage.get('down-setting-only-high'))),
            downRepeat: Boolean(Number(Storage.get('down-setting-repeat'))),
          };
        } else {
          const { onlyHigh, downRepeat } = this.downSetting;
          Storage.set({
            'down-setting-only-high': Number(onlyHigh),
            'down-setting-repeat': Number(downRepeat),
          });
          this.$message.success('修改成功，下一首生效');
        }
      },
      downSize(v) {
        Storage.set('down_size', v);
      },
      downHigh(v) {
        Storage.set('down_high', v);
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        showList: 'getShowList',
        allSongs: 'getAllSongs',
        favList: 'getFavList',
        add2DirInfo: 'add2DirInfo',
        tagInfo: 'getTagInfo',
        tags: 'getTagList',
        searchKey: 'getSearchKey',
        downSettingStr: 'getDownSettingDialog',
      }),
    },
    methods: {
      handleAddInfo(data) {
        const { song, add, dir } = data;
        if (!dir && add) {
          this.selectedTag = {};
          this.showChooseTag = true;
          return;
        }
        if (!song.songmid) {
          return;
        }
        let params = {}, u = 0;
        // 添加用的是 songmid，删除用的是songid，两个不一样
        if (add) {
          params = { midlist: song.songmid, dirid: dir.dirid, typelist: new Array(song.songmid.split(',').length).fill(13).join(',') };
        } else {
          params = { uin: Storage.get('uQ'), dirid: dir.dirid, ids: song.songid, types: new Array(String(song.songid).split(',').length).fill(3).join(',') };
          u = 1;
        }
        this.addToDir(params, u, dir.dissid, song.songmid);
      },
      // 请求的部分
      addToDir(params, u, disstid, id) {
        const g_tk = Storage.get('qy_token');
        const uQ = Storage.get('uQ');
        // 一些校验，如果没登录、上次的添加还没结束等就停一下
        if (window.is2Dir) {
          this.$notify({
            title: '操作失败',
            message: '别急，等一下上次的操作结果，等不及就刷新一下',
          });
          return;
        }
        if (!uQ) {
          this.$message.error('请先点击右上角登陆');
          return;
        }
        if (!g_tk) {
          this.showTokenDialog = true;
          return;
        }
        window.is2Dir = true;
        const iframe = document.getElementById('add2Dir');
        this.showChooseTag = false;
        this.showDelConfirm = false;

        // 参数拼装
        const data = {
          g_tk,
          formsender: 4,
          ...params,
        };
        const dataArr = Object.keys(data).map(k => `${k}=${data[k]}`);

        // iframe 加载完成后会触发的函数，就是请求的回调函数
        window.add2DirCb = this.checkResult(disstid, uQ, u, id);
        // iframe请求
        const url = ['//c.y.qq.com/splcloud/fcgi-bin/fcg_music_add2songdir.fcg', '//c.y.qq.com/qzone/fcg-bin/fcg_music_delbatchsong.fcg'];
        iframe.src = `${url[u]}?${dataArr.join('&')}`
      },
      checkResult(disstid, uQ, u, id) {
        console.log(this.tagInfo.selected.dissid, disstid, this.searchKey)
        request.getQQMyFavList(disstid, uQ,
          {
            isFav: disstid === this.favList.disstid,
            upShow: this.tagInfo.selected.dissid === disstid && this.searchKey === '列表内'
          },
          (songs) => {
            let resultCount = 0;
            const ids = id.split(',');
            ids.forEach(i => {
              if (songs.find(s => s.songmid === i)) {
                resultCount++;
              }
            });
            window.is2Dir = false;
            if (resultCount === ids.length && !u) {
              this.$message.success('添加成功！');
            } else if (!resultCount && u) {
              this.$message.success('删除成功！');
            } else {
              this.$message.error('cookie过期了？');
              this.showTokenDialog = true;
            }
          })
      },
    }
  }
</script>

<style scoped lang="scss">
  .choose-tag-list {
    border: 1px solid #eee;
    border-radius: 8px;
    max-height: 240px;
    overflow-y: auto;
    padding: 1px 0;

    &::-webkit-scrollbar
    {
      width:5px;
      height:5px;
      background-color:rgba(0,0,0,0);
    }
    /*定义滚动条轨道
     内阴影+圆角*/
    &::-webkit-scrollbar-track
    {
      border-radius:10px;
      background-color: #fff;
    }
    /*定义滑块
     内阴影+圆角*/
    &::-webkit-scrollbar-thumb
    {
      border-radius:10px;
      background-color: #ccc;
    }

    .choose-tag-item {
      border-top: 1px solid #eee;
      padding: 8px 12px;
      color: #777;
      box-sizing: border-box;
      opacity: 0.6;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
      &:first-child {
        border-top: none;
      }
      &.selected {
        border: 1px solid #409EFF;
      }

      &:nth-child(2n+1) {
        background: #eff8ff;
      }
    }
  }
</style>