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
    <div class="input-row" v-if="showDrawMusic">
      <div class="input-label">音频样式：</div>
      <div class="input-content">
        <el-radio-group v-model="drawMusicStyle">
          <el-radio-button label="rect">柱状图</el-radio-button>
          <el-radio-button label="line">曲线</el-radio-button>
          <el-radio-button label="line2">曲线2</el-radio-button>
          <el-radio-button label="particle">泡泡</el-radio-button>
          <el-radio-button label="particle2">粒子</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="input-row" v-if="showDrawMusic">
      <div class="input-label">音频数量：</div>
      <div class="input-content">
        <el-radio-group v-model="drawMusicNum">
          <el-radio-button label="32">32</el-radio-button>
          <el-radio-button label="64">64</el-radio-button>
          <el-radio-button label="128">128</el-radio-button>
        </el-radio-group>
        <div class="input-explain">看自己的性能来定</div>
      </div>
    </div>

    <div class="setting-title">播放设置</div>
    <div class="input-row">
      <div class="input-row">
        <div class="input-label">默认品质：</div>
        <div class="input-content">
          <el-radio-group v-model="listenSize">
            <el-radio-button label="128">128k</el-radio-button>
            <el-radio-button label="320">320k</el-radio-button>
            <el-radio-button label="flac">无损</el-radio-button>
          </el-radio-group>
          <div class="input-explain">限定企鹅/咪咕音乐！</div>
        </div>
      </div>
    </div>

    <div class="setting-title">下载设置</div>
    <div class="input-row">
      <div class="input-label">默认品质：</div>
      <div class="input-content">
        <el-radio-group v-model="downSize">
          <el-radio-button label="128">128k</el-radio-button>
          <el-radio-button label="320">320k</el-radio-button>
          <el-radio-button label="flac">无损</el-radio-button>
        </el-radio-group>
        <div class="input-explain">限定企鹅/咪咕音乐！</div>
      </div>
    </div>
    <div class="input-row">
      <div class="input-label">重复下载：</div>
      <div class="input-content">
        <el-radio-group v-model="repeatDown">
          <el-radio-button label="0">自动过滤</el-radio-button>
          <el-radio-button label="1">继续下载</el-radio-button>
        </el-radio-group>
        <div class="input-explain">下载中心的重新下载不受影响！</div>
      </div>
    </div>
  </div>
</template>

<script>
  import Storage from '../assets/utils/Storage';
  export default {
    name: "Setting",
    data() {
      return {
        showDrawMusic: Storage.get('showDrawMusic') !== '0',
        drawMusicType: Storage.get('drawMusicType') || '1',
        drawMusicNum: Storage.get('drawMusicNum') || '64',
        repeatDown: Storage.get('repeatDown') || '0',
        downSize: Storage.get('downSize') || 'flac',
        drawMusicStyle: Storage.get('drawMusicStyle') || 'rect',
        listenSize: Storage.get('listenSize') || '128',
      }
    },
    watch: {
      showDrawMusic(v) {
        Storage.set('showDrawMusic', Number(v));
        this.$message.info('刷新生效！');
      },
      drawMusicType(v) {
        Storage.set('drawMusicType', v);
      },
      drawMusicNum(v) {
        Storage.set('drawMusicNum', v);
      },
      repeatDown(v) {
        Storage.set('repeatDown', v);
      },
      downSize(v) {
        Storage.set('downSize', v);
      },
      listenSize(v) {
        Storage.set('listenSize', v);
      },
      drawMusicStyle(v) {
        Storage.set('drawMusicStyle', v);
      },
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