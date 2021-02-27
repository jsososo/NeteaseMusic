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
          v-for="(v, listId) in showList.mine"
          :class="`list-item ${add2ListId === listId && 'selected'}`"
          @click="add2ListId = listId"
          :key="`list-${listId}`"
        >
          {{showList.obj[listId].name}}
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
  import request from '../assets/utils/request';
  import Storage from "../assets/utils/Storage";
  export default {
    name: "Operation",
    data() {
      return {
        showDelSong: false,
        showAddSong: false,
        add2ListId: '',
        showList: {},
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
        const { data, type } = v;
        if (!data) return;
        const { platform } = this.allSongs[data.tracks];
        const { user } = this;
        this.platform = platform;
        switch (platform) {
          case 'qq':
            if (Storage.get('haveQCookie') !== '1') {
              return this.$message.warning('请先去设置页设置好 Cookie');
            }
            break;
          case '163':
            if (!user || !user.userId) {
              return this.$message.warning('请先登录');
            }
            break;
          default: return;
        }
        switch (type) {
          case 'DEL_SONG':
            this.showDelSong = true;
            break;
          case 'ADD_SONG_2_LIST':
            this.showList = this.userList[platform];
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
        this.add2ListId = this.add2ListId || this.operation.data.pid;
        const { platform, add2ListId, operation, userList, allSongs, allList } = this;
        const { type, data } = operation;
        if (req) {
          let reqData = { ...data };
          let api = 'PLAYLIST_TRACKS';
          if (type === 'ADD_SONG_2_LIST') {
            reqData.pid = add2ListId;
          }
          reqData.pid = reqData.pid.replace(`${platform}_`, '');
          reqData.tracks = reqData.tracks.replace(`${platform}_`, '');

          if (platform === 'qq') {
            api = (type === 'ADD_SONG_2_LIST') ? 'QQ_SONG_LIST_ADD' : 'QQ_SONG_LIST_REMOVE';
            reqData.dirid = userList.qq.obj[`qq_${reqData.pid}`].dirid;
            reqData.mid = reqData.tracks;
            reqData.id = allSongs[data.tracks].songid;
          }

          const errTxt = {
            qq: '操作失败',
            163: '操作失败：可能是歌曲下架了'
          }[platform];
          let successFunc = () => {
            this.$message.success('操作成功！');
            let songs = allList[add2ListId] || [];

            if (operation.type === 'ADD_SONG_2_LIST') {
              songs.unshift(operation.data.tracks);
            } else if (operation.type === 'DEL_SONG') {
              songs = songs.filter((id) => id !== operation.data.tracks);
            }
            this.$store.dispatch('updateList', { songs, listId: add2ListId });
          }
          request({
            api,
            data: reqData,
          }).then(
            (res) => successFunc(),
            (err) => {
              let message = errTxt;
              if (platform === '163') {
                if (err.data.body && err.data.body.code === 200) {
                  return successFunc();
                }
                message = err.data.message || (err.data.body && err.data.body.message) || message;
              }
              this.$message.error(message);
          });
        }
        this.clearOperation();
      },
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