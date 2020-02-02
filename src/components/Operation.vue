<template>
  <div class="operation-dialog-container">
    <!-- 从歌单中删除 -->
    <el-dialog
      title="删除"
      :visible.sync="showDelSong"
      width="30%"
    >
      <span>从歌单中删除？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handelPlayList(false)">取 消</el-button>
        <el-button type="primary" @click="handelPlayList(true)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加到歌单 -->
    <el-dialog
      :title="`添加到 ${add2ListId ? showList.obj[add2ListId].name : ''}`"
      :visible.sync="showAddSong"
      width="30%"
    >
      <div class="add-2-list hide-scroll">
        <div
          v-for="item in showList.list"
          :class="`list-item ${add2ListId === item.id && 'selected'}`"
          @click="add2ListId = item.id"
          v-if="!item.subscribed"
          :key="`list-${item.id}`"
        >
          {{item.name}}
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handelPlayList(false)">取 消</el-button>
        <el-button type="primary" :disabled="!add2ListId" @click="handelPlayList(true)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import request, { getMyList } from '../assets/utils/request';
  import Storage from "../assets/utils/Storage";
  export default {
    name: "Operation",
    data() {
      return {
        showDelSong: false,
        showAddSong: false,
        add2ListId: '',
        showList: [],
      }
    },
    computed: {
      ...mapGetters({
        operation: 'getOperation',
        userList: 'getUserList',
        qUserList: 'getQUserList',
        allList: 'getAllList',
        user: 'getUser',
        allSongs: 'getAllSongs',
      })
    },
    watch: {
      operation(v = {}) {
        const { user } = this;
        if (v.platform === 'qq' && Storage.get('haveQCookie') !== '1') {
          return this.$message.warning('请先去设置页设置好 Cookie');
        }
        if ((!v.platform || v.platform === '163') && (!user || !user.userId)) {
          return this.$message.warning('请先登录');
        }
        switch (v.type) {
          case 'DEL_SONG':
            this.showDelSong = true;
            break;
          case 'ADD_SONG_2_LIST':
            this.showList = {
              163: this.userList,
              qq: this.qUserList,
            }[v.platform || '163'];
            this.showAddSong = true;
            break;
        }
      },
    },
    methods: {
      clearOperation() {
        this.showDelSong = false;
        this.showAddSong = false;
        this.add2ListId = '';
        this.$store.dispatch('setOperation', {});
      },
      async handelPlayList(req) {
        if (req) {
          if (this.operation.platform === 'qq') {
            return this.handleQQPlaylist();
          }
          if (this.operation.type === 'ADD_SONG_2_LIST') {
            this.operation.data.pid = this.add2ListId;
          }
          const res = await request({
            api: 'PLAYLIST_TRACKS',
            data: this.operation.data,
          });
          res && getMyList(undefined, undefined, this.operation.data.pid);
          res && this.$message.success('操作成功～');
          !res && this.$message.error('操作失败：可能是歌曲下架了');
        }
        this.clearOperation();
      },
      async handleQQPlaylist() {
        const { operation } = this;
        let api = 'QQ_SONG_LIST_REMOVE';
        const data = {};
        const mid = operation.data.tracks;
        if (operation.type === 'ADD_SONG_2_LIST') {
          data.dirid = this.qUserList.obj[this.add2ListId].dirid;
          data.mid = mid;
          api = 'QQ_SONG_LIST_ADD';
        } else if (operation.type === 'DEL_SONG') {
          data.id = this.allSongs[mid].songid;
          data.dirid = this.qUserList.obj[operation.data.pid].dirid;
        }
        request({
          api,
          data,
        }).then(() => {
          this.$message.success('操作成功！');
          const listId = `qq${operation.data.pid || this.add2ListId}`;
          let songs = this.allList[listId] || [];
          if (operation.type === 'ADD_SONG_2_LIST') {
            songs.unshift(mid);
          } else if (operation.type === 'DEL_SONG') {
            songs = songs.filter((id) => id !== mid);
          }
          this.$store.dispatch('query163List', { songs, listId });
          this.clearOperation();
        }, (err) => {
          this.$message.error(err.errMsg);
          this.clearOperation();
        });
      }
    },
  }
</script>

<style lang="scss" scoped>
  .operation-dialog-container {
    .add-2-list {
      overflow-y: auto;
      width: 100%;
      border: 1px solid #f8f8f8;

      &::-webkit-input-placeholder {
        color: rgba(255,255,255,0.5);
      }

      .list-item {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        height: 33px;
        line-height: 33px;
        padding-left: 20px;
        border: 1px solid transparent;
        opacity: 0.8;
        cursor: pointer;
        transition: 0.3s;
        
        &:nth-child(odd) {
          background: #409EFF11;
        }
        
        &.selected {
          opacity: 1;
          border-color: #409EFF88;
        }
      }
    }
  }
</style>