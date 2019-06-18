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
      :title="`添加到 ${add2ListId ? userList.obj[add2ListId].name : ''}`"
      :visible.sync="showAddSong"
      width="30%"
    >
      <div class="add-2-list">
        <div
          @click="add2ListId = item.id"
          :class="`list-item ${add2ListId === item.id && 'selected'}`"
          v-for="item in userList.list"
          v-if="!item.subscribed"
          :key="list-`${item.id}`"
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
  export default {
    name: "Operation",
    data() {
      return {
        showDelSong: false,
        showAddSong: false,
        add2ListId: '',
      }
    },
    computed: {
      ...mapGetters({
        operation: 'getOperation',
        userList: 'getUserList',
      })
    },
    watch: {
      operation(v = {}) {
        switch (v.type) {
          case 'DEL_SONG':
            this.showDelSong = true;
            break;
          case 'ADD_SONG_2_LIST':
            this.showAddSong = true;
            break;
        }
      },
    },
    methods: {
      clearOperation() {
        this.$store.dispatch('setOperation', {});
      },
      async handelPlayList(req) {
        if (req) {
          if (this.operation.type === 'ADD_SONG_2_LIST') {
            this.operation.data.pid = this.add2ListId;
          }
          const res = await request({
            api: 'PLAYLIST_TRACKS',
            data: this.operation.data,
          });
          res && getMyList(undefined, undefined, this.operation.data.pid);
          res && this.$message.success('操作成功～');
        }
        this.showDelSong = false;
        this.showAddSong = false;
        this.clearOperation();
      },
    },
  }
</script>

<style lang="scss" scoped>
  .operation-dialog-container {
    .add-2-list {
      max-height: 300px;
      overflow-y: auto;
      width: 387px;
      border: 1px solid #f8f8f8;

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