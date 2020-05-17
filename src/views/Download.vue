<template>
  <div class="download-page">
    <h2>下载中心</h2>
    <div class="mt_20" style="line-height: 30px;">
      <div v-if="downloadInfo.count > 0" class="inline-block">还有{{downloadInfo.count}}首在努力下载中</div>
      <div v-if="downloadInfo.count === 0" class="inline-block">没在下载啦</div>
      <div class="pull-right">
        <div v-if="downloadInfo.count > 0" class="down-button" @click="updateDownload({ status: 'abortAll' })">全部取消</div>
        <div class="down-button" @click="updateDownload({ status: 'clearError' })">删除失败记录</div>
        <div class="down-button" @click="updateDownload({ status: 'clear'})">删除全部记录</div>
      </div>
    </div>
    <div class="download-list">
      <div class="download-list-item" v-for="(item, index) in downloadInfo.list" :key="item.id">
        <div class="index-num">{{index + 1}}</div>
        <div class="song-info">
          <span class="item-name">{{item.name}}</span>
          <span class="item-br">{{getBr(item.br)}}</span>
        </div>
        <div class="item-status">
          <div v-if="item.status === 'init'">准备一下</div>
          <div v-if="item.status === 'error'">下载失败：{{item.errMsg}}</div>
          <div v-if="item.status === 'progress'" class="item-progress">
            <div class="down-progress" :style="`width: ${item.p}%;`"></div>
            {{item.p}}%
          </div>
          <div v-if="item.status === 'success'">下载完成</div>
        </div>
        <div class="item-time">{{getTime(item.startTime)}}</div>
        <div class="item-operation">
          <div class="down-button" v-if="['init', 'progress'].indexOf(item.status) === -1" @click="download(item.song.aId, item.name, true, item.song)">重新下载</div>
          <div class="down-button" v-if="['init', 'progress'].indexOf(item.status) > -1" @click="updateDownload({ status: 'abort', id: item.id })">取消下载</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import timer from '../assets/utils/timer';
  import { mapGetters } from 'vuex';
  import { download } from "../assets/utils/request";

  export default {
    name: "Download",
    data() {
      return {}
    },
    computed: {
      ...mapGetters({
        downloadInfo: 'getDownloadInfo'
      })
    },
    created() {
      this.$store.dispatch('updateShowCover', false);
    },
    methods: {
      getBr(val) {
        if (val > 320000) {
          return '无损';
        }
        switch (val) {
          case 128000:
            return '128k';
          case 320000:
            return '320k';
          default:
            return `${val / 1000}k`;
        }
      },
      getTime(val) {
        return timer(val).str('YY-M-D HH:mm:ss');
      },
      updateDownload(obj) {
        this.$store.dispatch('updateDownload', obj);
      },
      download,
    }
  }
</script>

<style lang="scss" scoped>
  .download-page {
    color: #fffc;
    width: 80vw;
    margin-left: 10vw;
    margin-top: 10px;

    .down-button {
      display: inline-block;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid #fff5;
      margin-left: 12px;
      color: #fff5;
      font-size: 14px;
      transition: 0.3s;
      cursor: pointer;
      
      &:hover {
        color: #fffa;
        border-color: #fffa;
        border-radius: 4px;
      }
    }

    .download-list {
      border-top: 1px solid #fff3;
      margin-top: 30px;
      margin-bottom: 30px;

      .download-list-item {
        border-bottom: 1px solid #fff3;
        height: 30px;
        padding: 20px;
        overflow: hidden;
        position: relative;
        white-space: nowrap;

        .index-num {
          font-size: 70px;
          position: absolute;
          left: 10px;
          font-weight: bold;
          top: 5px;
          color: #fff3;
        }
        .song-info, .item-status, .item-time, .item-progress, .item-operation {
          line-height: 30px;
          display: inline-block;
          margin-left: 15px;
        }
        .song-info {
          width: 350px;

          .item-name {
            display: inline-block;
            max-width: 300px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            vertical-align: top;
            font-size: 16px;
          }

          .item-br {
            display: inline-block;
            vertical-align: text-bottom;
            font-size: 12px;
            line-height: 14px;
            border: 1px solid #fff3;
            color: #fff6;
            padding: 1px 3px;
            margin-left: 5px;
          }
        }

        .item-status {
          margin-left: 10px;
          width: 300px;
        }

        .item-progress {
          width: 280px;
          border: 1px solid #fff5;
          height: 30px;
          font-size: 12px;
          text-align: center;
          border-radius: 5px;
          position: relative;

          .down-progress {
            width: 33.3%;
            height: 30px;
            position: absolute;
            top: 0;
            left: 0;
            background: linear-gradient(to right, #fff3, #1890ff55);
          }
        }
      }
    }
  }
</style>