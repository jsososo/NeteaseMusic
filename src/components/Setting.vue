<template>
  <div class="setting-container">
    <div class="setting-title">频谱图设置</div>
    <div class="input-row">
      <div class="input-label">
        先进模式：
      </div>
      <div class="input-content">
        <el-switch v-model="useAudioContext" />
        <div class="input-explain">刷新生效，关闭后停用AudioContext, 无法展示频谱图，但是能解决大部分无法播放的问题</div>
      </div>
    </div>
    <div class="input-row" v-if="useAudioContext">
      <div class="input-label">
        看见音乐：
      </div>
      <div class="input-content">
        <el-switch v-model="showDrawMusic" />
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
<!--          <el-radio-button label="line2">曲线2</el-radio-button>-->
          <el-radio-button label="particle">泡泡</el-radio-button>
<!--          <el-radio-button label="particle2">粒子</el-radio-button>-->
          <el-radio-button label="circle">圈圈</el-radio-button>
          <el-radio-button label="circle2">海螺</el-radio-button>
<!--          <el-radio-button label="circle3">圆环</el-radio-button>-->
        </el-radio-group>
      </div>
    </div>

    <div class="setting-title">企鹅音乐Cookie</div>
    <div class="input-row">
      <div class="input-label">开启：</div>
      <div class="input-content">
        <el-switch v-model="openSetQCookie" />
        <div class="input-explain">开启并设置Cookie后可以获得更多操作</div>
      </div>
    </div>
    <div class="input-row" v-if="openSetQCookie">
      <div class="input-label">手动输入：</div>
      <div class="input-content">
        <el-input
          style="width: 450px"
          type="text"
          placeholder="在 y.qq.com 控制台输入 document.cookie，将打印的字符串粘贴进来"
          v-model="inputCookie"
        />
        <el-button class="mt_10" @click="setCookie">设置</el-button>
        <span class="input-explain pl_20">Cookie 数据仅存储在本地（不会获取 Cookie 的也可以借助下面的插件手动复制！）</span>
      </div>
    </div>
    <div class="input-row"  v-if="openSetQCookie">
      <div class="input-label">半自动获取：</div>
      <div class="input-content">
        <div>
          <div>1、下载并解压 <a href="http://music.jsososo.com/download/qqmusic_cookie_porter_1_0.zip" target="_blank" >获取企鹅音乐Cookie的 Chrome 插件</a></div>
          <div class="mt_5">
            2、打开新标签页输入 <i>chrome://extensions</i>，钩上右上角开发者模式，
            点击左上角加载已解压的插件，选择刚才解压出的文件夹
          </div>
          <div class="mt_5">
            3、打开 <a href="https://y.qq.com?forceUpdateCookie=1" target="_blank">https://y.qq.com</a> 并登陆企鹅号即可自动获取
          </div>
        </div>
        <div class="input-explain">Cookie 数据会存储于服务器</div>
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
      <div class="input-row">
        <div class="input-label">点击歌曲：</div>
        歌单详情页点击歌曲时，
        <el-radio-group v-model="PLAY_MUSIC_FROM_PLAYLIST">
          <el-radio-button label="0">仅将这首歌曲加入播放列表</el-radio-button>
          <el-radio-button label="1">将播放列表替换为当前列表</el-radio-button>
        </el-radio-group>
      </div>
      <div class="input-row">
        <div class="input-label">点击歌曲：</div>
        歌曲列表（专辑、歌手、搜索等）点击歌曲时，
        <el-radio-group v-model="PLAY_MUSIC_FROM_LIST">
          <el-radio-button label="0">仅将这首歌曲加入播放列表</el-radio-button>
          <el-radio-button label="1">将播放列表替换为当前列表</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="setting-title">下载设置</div>
    <div class="input-row">
      <div class="input-label">下载歌词：</div>
      <div class="input-content">
        <el-switch v-model="downLyric" />
      </div>
    </div>
    <div class="input-row" v-if="downLyric">
      <div class="input-label">歌词翻译：</div>
      <div class="input-content">
        <el-switch v-model="downLyricTrans" />
      </div>
    </div>
    <div class="input-row">
      <div class="input-label">歌曲名：</div>
      <div class="input-content">
        <el-radio-group v-model="downName">
          <el-radio-button label="0">歌手-歌名</el-radio-button>
          <el-radio-button label="1">歌名-歌手</el-radio-button>
          <el-radio-button label="2">歌名</el-radio-button>
        </el-radio-group>
      </div>
    </div>
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
  import { checkCookie } from "../assets/utils/request";
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
        openSetQCookie: Storage.get('openSetQCookie') !== '0',
        useAudioContext: Storage.get('useAudioContext') !== '0',
        inputCookie: '',
        downName: Storage.get('downMusicName') || '0',
        downLyric: Storage.get('downLyric', false, '0') !== '0',
        downLyricTrans: Storage.get('downLyricTrans', false, '0') !== '0',
        PLAY_MUSIC_FROM_PLAYLIST: Storage.get('PLAY_MUSIC_FROM_PLAYLIST'),
        PLAY_MUSIC_FROM_LIST: Storage.get('PLAY_MUSIC_FROM_LIST'),
      }
    },
    watch: {
      useAudioContext(v) {
        Storage.set('useAudioContext', Number(v));
        this.showDrawMusic = false;
      },

      ...(() => {
        const result = {};
        [
          'downLyric',
          'downLyricTrans',
          'showDrawMusic',
          'openSetQCookie',
        ].forEach((k) => result[k] = (v) => Storage.set(k, Number(v)));
        return result;
      })(),
      ...(() => {
        const result = {};
        [
          'drawMusicType',
          'drawMusicNum',
          'repeatDown',
          'downSize',
          'listenSize',
          'drawMusicStyle',
          'downMusicName',
          'PLAY_MUSIC_FROM_PLAYLIST',
          'PLAY_MUSIC_FROM_LIST',
        ].forEach((k) => result[k] = (v) => Storage.set(k, v));
        return result;
      })(),
    },
    methods: {
      async setCookie() {
        const expireTime = new Date(Date.now() + 86400000).toString();
        try {
          this.inputCookie.split('; ').forEach((c) => {
            document.cookie=`${c}; expires=${expireTime}; `;
          });
          const result = await checkCookie();
          if (result.success) {
            this.$message.success('设置 Cookie 成功');
          } else {
            throw({ message: 'cookie wrong'})
          }
        } catch (err) {
          this.$message.error('cookie 错误或过期')
        }
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
        max-width: 450px;

        a {
          font-size: 14px;
          text-decoration: underline  ;
        }
      }
      .input-explain {
        font-size: 12px;
        margin-top: 10px;
      }
    }
  }
</style>