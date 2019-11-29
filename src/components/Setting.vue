<template>
  <div class="setting-container">
    <div class="setting-title">频谱图设置</div>
    <div class="input-row">
      <div class="input-label">
        看见音乐：
      </div>
      <div class="input-content">
        <el-switch v-model="showDrawMusic" />
        <div class="input-explain">开启音频图后会影响性能和流量</div>
      </div>
    </div>
    <div class="input-row" v-if="showDrawMusic">
      <div class="input-label">
        频谱设置：
      </div>
      <div class="input-content">
        <el-radio-group v-model="drawMusicType">
          <el-radio-button label="1">低频 => 高频</el-radio-button>
          <el-radio-button label="2">高频 => 低频 => 高频</el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script>
  import Storage from '../assets/utils/Storage';
  export default {
    name: "Setting",
    data() {
      console.log(Storage.get('showDrawMusic'));
      return {
        showDrawMusic: Storage.get('showDrawMusic') !== '0',
        drawMusicType: Storage.get('drawMusicType') || '1',
      }
    },
    watch: {
      showDrawMusic(v) {
        Storage.set('showDrawMusic', Number(v));
        this.$message.info('刷新生效！');
      },
      drawMusicType(v) {
        Storage.set('drawMusicType', v);
      }
    }
  }
</script>

<style scoped lang="scss">
  .setting-container {
    color: #fff8;
    .setting-title {
      font-size: 20px;
      font-weight: bold;
      margin: 15px 0;
    }

    .input-row {
      margin-bottom: 10px;

      .input-label {
        display: inline-block;
        vertical-align: top;
        width: 100px;
      }
      .input-content {
        display: inline-block;
        vertical-align: top;
      }
      .input-explain {
        font-size: 12px;
        margin-top: 10px;
      }
    }
  }
</style>