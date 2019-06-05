<template>
  <div class="ml_20 mt_20 download-page">
    <h2><a href="#/">
      <i class="back-icon el-icon-arrow-left"></i>
    </a>下载中心</h2>

    <div class="mt_20 ml_20" style="line-height: 28px;">
      <div class="inline-block mr_20">下载中：{{downLoad.count}}</div>
      <div class="setting-btn" @click="$store.dispatch('updateDownSettingDialog', '下载设置')">下载设置</div>
      <div class="setting-btn" @click="delList(false)">删除失败记录</div>
      <div class="setting-btn" @click="delList(true)">删除全部记录</div>（不取消正在下载）
      <div class="setting-btn" @click="stopAll">全部取消下载</div>
      <div class="inline-block">（点击重新下载不会受设置限制）</div>
    </div>

    <div class="down-list">
      <div
        v-for="(item) in downLoad.list"
        :key="item.id"
        class="down-item"
      >
        <div class="down-name">{{item.name}}</div>
        <div class="create-time">{{getTime(item.time)}}</div>
        <!-- 下载进度，只有下载中的会有 -->
        <div class="progress-container" v-if="item.status === 'down'">
          <div class="progress">
            <div class="progress-content" :style="`width: ${getCalculate(item, 'percent')}%;`"></div>
          </div>
          <div class="inline-block ml_10">{{getCalculate(item, 'percent')}}%</div>
          <div class="inline-block ml_10">{{getCalculate(item, 'loaded')}} / {{getCalculate(item, 'total')}} mb</div>
        </div>
        <!-- 下载中的，可以给个取消 -->
        <div
          v-if="item.status === 'init' || item.status === 'down'"
          class="inline-block pointer ml_10"
          @click="cancelDown(item)"
        >
          [ 取消下载 ]
        </div>
        <!-- 下载结束了的文件给一个重新下载 -->
        <div
          v-if="item.status !== 'init' && item.status !== 'down'"
          class="inline-block pointer ml_10"
          @click="download(item)"
        >
          [重新下载]
        </div>
        <!-- 删除 -->
        <div
          v-if="item.status !== 'init' && item.status !== 'down'"
          class="ml_10 inline-block pointer"
          @click="delItem(item)"
        >
          [删除]
        </div>
        <!-- 下载失败的 -->
        <div v-if="item.status === 'error'" class="ml_10 inline-block">
          下载失败：{{item.reason}}
        </div>
        <!-- 下载取消的 -->
        <div v-if="item.status === 'abort'" class="ml_10 inline-block">
          下载已取消
        </div>
        <!-- 下载成功的 -->
        <div v-if="item.status === 'success'" class="ml_10 inline-block">
          下载成功
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import timer from '../assets/utils/timer';
  import { changeUrlQuery } from "../assets/utils/stringHelper";
  import Storage from '../assets/utils/Storage';

  export default {
    name: "Download",
    computed: {
      ...mapGetters({
        downLoad: 'getDownList',
      })
    },
    methods: {
      getTime(num) {
        return timer(num).str('YY-M-D HH:mm:ss');
      },
      // 进度计算
      getCalculate(item, key) {
        const { progress } = item;
        const { percent } = progress;
        switch (key) {
          case 'percent':
            return (percent * 100).toFixed(2);
          case 'loaded':
          case 'total':
            return (progress[key] / 1024 / 1024).toFixed(2);
          default: return 0;
        }
      },
      // 取消下载
      cancelDown(item) {
        item.ajax.abort();
        this.$store.dispatch('updateDownloadList', { id: item.id, status: 'abort' })
      },
      // 重新下载
      download(item) {
        download({
          trueUrl: changeUrlQuery(Storage.get(['vkey', 'guid']), item.url, false),
          name: item.name,
          objectId: item.objectId,
        }, this, undefined, true);
      },
      // 删除
      delItem(item) {
        const { list } = this.downLoad;
        const newList = list.filter(s => s.id !== item.id);
        this.downLoad.list = newList;
        this.$store.dispatch('updateDownloadList', this.downLoad);
        Storage.set('down_list_info', newList, true);
      },
      // 删除记录
      delList(all = false) {
        const { count, list } = this.downLoad;
        const obj = { count };
        if (all) {
          obj.list = list.filter(item => item.status === 'init' || item.status === 'down');
        } else {
          obj.list = list.filter(item => item.status !== 'error' && item.status !== 'abort');
        }
        this.$store.dispatch('updateDownloadList', obj);
      },
      // 终止所有的下载
      stopAll() {
        const { list } = this.downLoad;
        const obj = { count: 0 };
        obj.list = list.map((item) => {
          if (item.status === 'init' || item.status === 'down') {
            item.ajax.abort();
            item.status = 'abort';
          }
          return item;
        });
        this.$store.dispatch('updateDownloadList', obj);
      }
    }
  }
</script>

<style scoped lang="scss">
  .download-page {
    color: #fff;

    .back-icon {
      font-size: 24px;
      color: white;
      margin-right: 15px;
      line-height: 33px;
      font-weight: bold !important;
      vertical-align: middle;
    }

    .setting-btn {
      border: 1px solid #fff;
      opacity: 0.8;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      padding: 0 12px;
      border-radius: 5px;
      display: inline-block;
      margin-left: 10px;
      transition: 0.3s;

      &:hover {
        opacity: 0.9;
      }
    }

    .down-list {
      border-top: 1px solid rgba(255,255,255,0.3);
      margin-top: 30px;

      .op7 {
        opacity: 0.7;
      }

      .down-item {
        line-height: 42px;
        border-bottom: 1px solid rgba(255,255,255,0.3);
        padding-left: 20px;

        .down-name {
          width: 400px;
          display: inline-block;
        }

        .create-time {
          margin-left: 20px;
          display: inline-block;
          vertical-align: top;
          width: 200px;
        }

        .progress-container {
          display: inline-block;
          margin-left: 10px;
          vertical-align: top;

          &.hidden {
            display: none;
          }

          .progress {
            border: 1px solid rgba(255,255,255,0.5);
            display: inline-block;
            height: 20px;
            line-height: 28px;
            width: 150px;
            overflow: hidden;
            border-radius: 5px;
            margin-left: 20px;

            .progress-content {
              background: rgba(255,255,255,0.8);
              height: 20px;
            }
          }
        }
      }
    }
  }
</style>