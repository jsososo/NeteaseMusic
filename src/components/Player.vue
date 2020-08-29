<template>
  <div class="player-container">
    <div v-if="showControl && playNow && playNow.id">
      <!-- 播放，上一首、下一首进度 -->
      <div class="control-btn">
        <div class="inline-block">
          <i class="icon-shangyishou1 iconfont" @click="cutSong('playPrev')"/>
        </div>
        <div class="inline-block" v-if="!playing">
          <i class="iconfont icon-bofang" @click="updatePlayingStatus(true)"/>
        </div>
        <div class="inline-block" v-if="playing">
          <i class="iconfont icon-zanting1" style="font-size: 34px;" @click="updatePlayingStatus(false)"/>
        </div>
        <div class="inline-block">
          <i class="icon-xiayishou1 iconfont" @click="cutSong('playNext')"/>
        </div>
      </div>
      <div class="inline-block progress-container">
        <!-- 歌曲信息 -->
        <div class="song-info">
          <i class="el-icon-loading mr_10" v-if="loading" />
          <span class="player-song-title pointer" @click="goTo('#/')">{{playNow.name}}</span>
          <span class="player-song-singer pl_20 pointer">
            <a v-for="a in playNow.ar" :key="a.id" :href="changeUrlQuery({ id: a.id, mid: a.mid, from: playNow.platform }, '#/singer', false)">{{a.name}} </a>
          </span>
          <span
            v-if="favSongMap[playNow.platform]"
            @click="likeMusic(playNow.aId)"
            style="margin-left: 25px; cursor: pointer;"
            :class="(favSongMap[playNow.platform][playNow.aId]) ? 'iconfont icon-like iconfont' : 'iconfont icon-unlike'">
          </span>
        </div>
        <!-- 歌曲播放进度 -->
        <div class="play-time">
          <span>
            {{formatTooltip(currentTime)}}
            /
            {{formatTooltip(playerInfo.duration)}}
          </span>
        </div>
        <!-- 进度条 -->
        <div class="progress" id="player-progress">
          <el-slider
            @change="(v) => playerDom.currentTime = v"
            :format-tooltip="formatTooltip"
            v-model="currentTime"
            :max="playerInfo.duration || 1" />
        </div>
      </div>
      <!-- 音量、播放顺序、列表等控制 -->
      <div class="other-control inline-block">
        <!-- 音量控制 -->
        <div class="volume-control"  @mouseleave="showVolume = false">
          <div v-if="showVolume" class="volume-slider-container" @mouseleave="showVolume = false" @mouseover="showVolume = true">
            <div class="volume-slider" >
              <el-slider
                v-model="volume"
                @input="changeVolume"
                :vertical="true"
                height="80px"
                :max="100"/>
            </div>
          </div>
          <i class="iconfont icon-volume" @mouseover="showVolume = true" />
        </div>
        <!-- 播放顺序 -->
        <div class="order-control"  @mouseleave="showOrder = false">
          <div v-if="showOrder" class="order-list-container" @mouseleave="showOrder = false" @mouseover="showOrder = true">
            <div class="order-list">
              <div v-for="key in orderList" v-if="orderType !== key" :key="`order-${key}`" @click="changeOrderType(key)">
                <i :class="`iconfont icon-${key}`" />
              </div>
            </div>
          </div>
          <div class="now-order-type" @mouseover="showOrder = true" >
            <i :class="`iconfont icon-${orderType}`" />
          </div>
        </div>

         <!--下载-->
        <el-tooltip class="item" effect="dark" content="下载" placement="top">
          <div class="inline-block ml_5 pd_5">
            <span @click="down(playNow.aId)">
              <i class="iconfont icon-download ft_16 pointer" />
            </span>
          </div>
        </el-tooltip>

        <!-- 添加到歌单 -->
        <el-tooltip class="item" effect="dark" content="添加到歌单" placement="top">
          <div class="inline-block ml_5 pd_5" v-if="playNow.platform !== 'migu'">
            <span @click="playlistTracks(playNow.aId, 'add', 'ADD_SONG_2_LIST')">
              <i class="iconfont icon-add ft_16 pointer" />
            </span>
          </div>
        </el-tooltip>

        <input id="cp-share-input" :value="changeUrlQuery({ shareId: playNow.id, from: playNow.platform, shareCid: playNow.cid }, 'http://music.jsososo.com/#/', false)">

        <el-tooltip class="item" effect="dark" content="正在播放" placement="top">
          <div @click="goTo('#/playlist/detail?id=playing')" class="inline-block ml_5 pd_5">
            <span>
              <i class="iconfont icon-list ft_16 pointer" />
            </span>
          </div>
        </el-tooltip>

        <!-- 更多 -->
        <div class="more-control"  @mouseleave="showMore = false">
          <div v-if="showMore" class="more-list-container" @mouseleave="showMore = false" @mouseover="showMore = true">
            <div class="more-list">
              <div v-for="more in moreList" @click="handleClickMore(more.key)">
                <i :class="`iconfont icon-${more.key}`" />
                <span style="padding-left: 5px;">{{more.text}}</span>
              </div>
            </div>
          </div>
          <div class="ml_10" @mouseover="showMore = true" >
            <i class="iconfont icon-more" />
          </div>
        </div>

        <div class="back-container">
          <a class="iconfont icon-feedback" href="#/feedback" />
          <div class="back-icon pointer" @click="goBack">
            <i class="iconfont icon-arrow-left" />
            BACK
          </div>
        </div>

      </div>
    </div>
    <audio id="m-player" crossOrigin="anonymous" :src="playingUrl || ''" controls></audio>
  </div>
</template>

<script>
  import Num from '../assets/utils/num';
  import Storage from '../assets/utils/Storage';
  import { mapGetters } from 'vuex';
  import request, {
    likeMusic,
    download,
    getPersonFM,
    handleQQComments,
    getHighQualityUrl, getDownName, queryLyric, downLyricFunc
  } from '../assets/utils/request';
  import { handleLyric, getQueryFromUrl, changeUrlQuery } from "../assets/utils/stringHelper";
  import ArrayHelper from '../assets/utils/arrayHelper';
  import DrawMusic from "../assets/utils/drawMusic";
  import downReq from '../assets/utils/download';

  export default {
    name: "PlayerPage",
    data() {
      return {
        playerDom: null,
        currentTime: 0,
        volume: 0,
        stopUpdateCurrent: false,
        showVolume: false,
        showOrder: false,
        showMore: false,
        orderList: ['suiji', 'danquxunhuan', 'liebiao'],
        orderType: Storage.get('orderType'),
        showControl: !getQueryFromUrl('hideControl'),
        playerInfo: {
          current: 0,
          duration: 0,
        },
        playingId: 0,
        playingPlatform: '',
        listId: 0,
        keys: [],
        errorId: '',
        playingUrl: '',
        isUpdating: false,
        moreList: [
          { key: 'share', text: '分享' },
          { key: 'down-lyric', text: '歌词' },
          { key: 'home', text: '歌词' },
        ]
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        playing: 'isPlaying',
        downloading: 'isDownloading',
        loading: 'isLoading',
        allSongs: 'getAllSongs',
        radioInfo: 'getRadioInfo',
        userList: 'getUserList',
        allList: 'getAllList',
        user: 'getUser',
        playingListId: 'getPlayingListId',
        isPersonFM: 'isPersonFM',
        playingList: 'getPlayingList',
        mode: 'getMode',
        favSongMap: 'getFavSongMap',
      }),
    },
    watch: {
      async playNow(v) {
        if (!v) {
          return;
        }
        const { listId, playingId, playerInfo, isPersonFM, playingList, playingPlatform, isUpdating, pDom } = this;
        const { id, lyric, name, comments, mid, songid, cId, br, pUrl, aId, platform, qqId, miguId, al = {}, ar = [] } = v;
        let { url } = v;
        const dispatch = this.$store.dispatch;
        const listenSize = Storage.get('listenSize') || '128';
        if (isUpdating)
          return;
        // 这是刚切歌的时候需要判断下用户选择的播放品质并更新一下，同时如果已经在查询

        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: name,
            artist: ar.map((v) => v.name).join('/'),
            album: al.name,
            artwork: [
              {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '96x96'},
              {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '128x128'},
              {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '192x192'},
              {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '256x256'},
              {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '384x384'},
              {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '512x512'},
            ]
          });
        }
        if ((pUrl !== this.playingUrl || !this.playingUrl) && url) {
          dispatch('setLoading', true);
          this.isUpdating = true;
          const listenBr = {128: 128000, 320: 320000, flac: 960000}[listenSize];
          let [nUrl, nBr] = [url, br]; // 默认原始的信息
          if ((pUrl && Number(br) === listenBr) || listenSize === '128') { // 有 pUrl 且与当前选择的品质相同
            nUrl = pUrl || url;
            nBr = listenBr;
          } else if (qqId || miguId) { // 如果是qq音乐或者咪咕音乐，获取播放链接
            const result = await getHighQualityUrl(aId, listenSize);
            nUrl = result.url || url;
            nBr = result.br;
          }
          this.isUpdating = false;
          this.playingUrl = nUrl;
          pDom && pDom.pause();

          await dispatch('updateSongDetail', {
            pUrl: nUrl,
            br: nBr,
            id,
            aId,
          });
          setTimeout(() => {
            if (this.playing) {
              this.playerDom.play();
            }
          }, 1);
          return;
        }
        if (!this.playingUrl) {
          setTimeout(() => {
            if (!this.playingUrl) {
              this.cutSong('playNext');
            }
          }, 1000);
        }
        if (isPersonFM && (playingList.index >= (playingList.raw.length - 2))) {
          this.getPersonFM();
        }
        if (String(id) === String(playingId)) {
           // 如果是因为评论、歌词的更新，就不在走下面的步骤了
          return;
        }

        // 网易云的听歌打卡
        if (playerInfo.current > 0 && playingPlatform === '163') {
          let sourceid = (listId === 'daily' ? '' : listId) || '';
          if (!sourceid) {
            sourceid = this.allSongs[`163_${playingId}`].al.id;
          }
          // 听歌打卡
          request({
            api: 'SCROBBLE',
            data: {
              id: playingId,
              sourceid: String(sourceid).replace(`${playingPlatform}_`, ''),
              time: Num(playerInfo.current),
            }
          })
        }

        dispatch('updatePlayingPercent', 0);
        document.title = name;
        this.currentTime = 0;
        this.playingId = id;
        this.playingPlatform = v.platform || '163';
        this.listId = this.playingListId;

        // 更新后面的背景
        try {
          document.getElementById('play-music-bg').src = `${this.allSongs[aId].al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg'}?param=1440y1440`;
        } catch (err) {
          document.getElementById('play-music-bg').src = 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg';
        }

        if (v.miguId && this.playing) {
          setTimeout(() => {
            this.playerDom.play();
          }, 1);
        }
        // 没有歌词的拿歌词
        if (!lyric) {
          queryLyric(aId);
        }

        // 没有评论的拿评论
        if (!comments) {
          switch (v.platform) {
            case 'qq':
              request({
                api: 'QQ_GET_COMMENT',
                data: { id: songid },
              }).then((res) => {
                const comments = {
                  hot: handleQQComments(res.data.hotComment.commentlist),
                  latest: handleQQComments(res.data.comment.commentlist),
                  total: res.data.comment.commenttotal,
                  offset: 20,
                };
                dispatch('updateSongDetail', { comments, aId });
              });
              break;
            case 'migu':
              break;
            default:
              request({
                api: 'MUSIC_COMMENTS',
                data: {
                  offset: 0,
                  limit: 20,
                  id,
                }
              }).then((res) => {
                const comments = {
                  hot: res.hotComments || [],
                  latest: res.comments || [],
                  total: res.total,
                  offset: 20,
                };
                dispatch('updateSongDetail', { id, comments, aId });
              })
          }
        }
      },
    },
    mounted() {
      window.UPDARE_PLAYING_STATUS = this.updatePlayingStatus;
      this.playerDom = document.getElementById('m-player');
      this.playerDom.volume = Storage.get('volume') || 1;
      // 初始化音量
      this.volume = (Storage.get('volume') || 1) * 100;

      // audio标签
      const pDom = this.playerDom;
      window.pDom = pDom;
      // slider，进度条
      const sDom = document.getElementsByClassName('el-slider__button el-tooltip')[0];
      const dispatch = this.$store.dispatch;
      window.onhashchange = () => this.showControl = !getQueryFromUrl('hideControl');

      // 加载音频数据
      if ((window.AudioContext || window.webkitAudioContext) && Storage.get('useAudioContext') !== '0') {
        this.drawMusic = new DrawMusic();
        const draw = () => {
          this.drawMusic.draw();
          window.requestAnimationFrame(draw);
        }
        window.requestAnimationFrame(draw);
      }

      // audio加载完成
      pDom.oncanplaythrough = () => {
        if (this.playingUrl === this.playNow.pUrl) {
          dispatch('setLoading', false);

          if (this.playing) {
            pDom.play();
          }
        }
        this.playerInfo = { duration: pDom.duration, current: 0 };
        dispatch('updatePlayingPercent', 0);
      };
      // 如果不播放了可能是url过期了
      pDom.onerror = (err) => {
        const { id, aId } = this.playNow;
        if (!id) {
          return;
        }
        if (this.errorId === id) {
          return this.cutSong('playNext');
        }
        this.errorId = id;
        dispatch('setLoading', true);
        setTimeout(() => {
          if (pDom.error) {
            this.cutSong('playNext');
          }
        }, 50000);
        switch (this.playNow.platform) {
          case 'qq':
          case 'migu':
            dispatch('updateSongDetail', { id, purl: '', aId });
            break;
          default:
            request({ api: 'SONG_URL', data: { id }})
              .then((res) => {
                const { url, br } = res.data[0];
                if (!url) {
                  return this.cutSong('playNext');
                }
                dispatch('updateSongDetail', { url, br, id, pUrl: url, aId });
              });
        }
      };
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => this.updatePlayingStatus('play'));
        navigator.mediaSession.setActionHandler('pause', () => this.updatePlayingStatus('pause'));
        navigator.mediaSession.setActionHandler('previoustrack', () => this.cutSong('playPrev'));
        navigator.mediaSession.setActionHandler('nexttrack', () => this.cutSong('playNext'));
      }
      // audio正在加载音乐
      // pDom.onwaiting = () => console.log('waiting');
      // audio放完了
      pDom.onended = () => {
        if (this.orderType !== 'danquxunhuan') {
          dispatch('playNext');
        } else {
          // 单曲循环的话，继续播放这首
          pDom.play();
        }
      };
      // 音乐播放时进度条
      pDom.ontimeupdate = () => {
        !this.stopUpdateCurrent && (this.currentTime = this.playNow.url ? pDom.currentTime : 0);
        this.playerInfo = {
          current: this.currentTime,
          duration: pDom.duration,
        };
        dispatch('updatePlayingPercent', this.playerInfo.current / this.playerInfo.duration);
      };
      // 当点击进度条的滑块时需要停止进度的判断，否则松开鼠标后onchange事件无法返回正确的value
      sDom && (sDom.onmousedown = () => this.stopUpdateCurrent = true);
      // 键盘事件绑定
      window.onkeydown = ({ keyCode, target, ctrlKey, altKey, shiftKey }) => {
        // 输入框内的操作，忽略掉
        if (['textarea', 'input'].indexOf(target.nodeName.toLowerCase()) > -1) {
          return;
        }
        const codeMap = Storage.get('key_code_map', true);
        const codes = [];
        ctrlKey && codes.push('ctrl');
        altKey && codes.push('alt');
        shiftKey && codes.push('shiftKey');

        if ([16, 17, 18].indexOf(keyCode) === -1) {
          codes.push(keyCode);
        }

        let volume = Storage.get('volume') * 100;

        switch (codes.join('-')) {
          case codeMap.VOLUME_DOWN:
            volume = Math.max(volume - 10, 0);
            this.changeVolume(volume);
            this.$message.info(`音量调至${Num(volume, 0)}%`);
            return false;
          case codeMap.VOLUME_UP:
            volume = Math.min(volume + 10, 100);
            this.changeVolume(volume);
            this.$message.info(`音量调至${Num(volume, 0)}%`);
            return false;
          case codeMap.PLAY_PREV:
            this.cutSong('playPrev');
            return false;
          case codeMap.PLAY_NEXT:
            this.cutSong('playNext');
            return false;
          case codeMap.PLAY:
            this.updatePlayingStatus(!this.playing);
            return false;
          case (codeMap.TO_SIMPLE || 'ctrl-83'):
            window.location = '#/simple';
            return false;
          case (codeMap.QUIT_SIMPLE || '27'):
            if (this.mode === 'simple') {
              window.location = '#/';
            }
            return false;
        }
      };
      window.onkeypress = window.onkeydown;
      window.onkeyup = ({ keyCode }) => {
        this.keys = this.keys.filter((c) => c !== keyCode);
      };
    },
    methods: {
      formatTooltip(v) {
        return `${Num(v / 60, 0, -1)}:${Num(v % 60, 0) < 10 ? `0${Num(v % 60, 0)}` : Num(v % 60, 0)}`;
      },
      // 音量控制，写入缓存
      changeVolume(v) {
        this.playerDom.volume = v / 100;
        this.volume = Num(v, 0);
        Storage.set('volume', v / 100);
      },
      // 切换播放顺序
      changeOrderType(v) {
        this.orderType = v;
        Storage.set('orderType', v);
        this.$store.dispatch('updateRandomHistory');
      },
      // 播放、暂停
      updatePlayingStatus(status) {
        if (status === 'play') {
          window.actx && window.actx.resume();
        }
        this.playerDom[['pause', 'play'][Number(status)]]();
        this.$store.dispatch('updatePlayingStatus', status);
      },
      // 切歌。包括上一首。下一首
      cutSong(type) {
        window.actx && window.actx.resume();
        this.$store.dispatch(type);
      },
      down: download,
      likeMusic,
      goTo(url) {
        window.location = url;
      },
      playlistTracks(tracks, op, type) {
        window.event.stopPropagation();
        this.$store.dispatch('setOperation', { data: { tracks, op }, type });
      },
      goBack() {
        history.back(-1);
      },
      getPersonFM(second) {
        getPersonFM()
          .then((songs) => {
            const ids = songs.map((s) => s.id);
            this.$store.dispatch('setPersonFM', ids);
            if (ArrayHelper.hasDuplicate(ids, this.playingList.raw) && !second) {
              this.getPersonFM(true);
            }
          })
      },
      copyUrl() {
        const e = document.getElementById("cp-share-input");
        e.select();
        document.execCommand("Copy");
        this.$message.success('复制链接成功，去分享吧');
      },
      changeUrlQuery,
      handleClickMore(key) {
        const { playNow } = this;
        switch (key) {
          case 'share':
            this.copyUrl();
            break;
          case 'down-lyric':
            downLyricFunc(playNow);
            break;
          case 'home':
            window.location = '#/';
            break;
        }
      },
    }
  }
</script>

<style lang="scss">
  .mode-simple, .mode-mv {
    .player-container {
      bottom: -100px;
    }
  }
  audio {
    display: none !important;
  }
  .mode-mobile {
    .player-container {
      width: 100vw;
      height: 15vw;
      background: #fff3;

      .control-btn {
        display: none;
      }

      .progress-container {
        margin: 0 !important;
        font-size: 2.5vw !important;
        line-height: 15vw;
        position: relative;
        width: 90%;

        .song-info {
          vertical-align: top;
          max-width: 40vw;
          position: relative;

          .player-song-title {
            font-size: 3vw;
            line-height: 10vw;
            vertical-align: top;
          }
          .player-song-singer {
            position: absolute;
            top: 8vw;
            line-height: 5vw;
            font-size: 2.2vw;
            left: 0;
            padding-left: 0 !important;
          }
        }
        .iconfont {
          display: inline-block;
          vertical-align: top;
        }
        .play-time {
          margin-left: 5vw;
          position: absolute;
          right: 2vw;
        }
      }

      .other-control {
        display: none !important;
      }

      #player-progress {
        display: none;
      }

      .back-icon {
        display: none;
      }
    }
  }
  .player-container {
    z-index: 1000;
    width: 100vw;
    height: 90px;
    position: fixed;
    bottom: 0;
    left: 0;
    padding-left: 20px;

    #cp-share-input {
      opacity: 0;
      position: fixed;
      top: -1000px;
    }

    .other-control {
      margin-left: 25px;
      margin-top: 32px;

      .iconfont {
        font-size: 20px;

        &.icon-xiazai:before {
          font-size: 16px;
          vertical-align: -1px;
          cursor: pointer;
        }
      }

      .order-control {
        display: inline-block;
        position: relative;

        .now-order-type {
          padding: 10px;
          margin-top: -5px;
        }

        .order-list-container {
          padding-bottom: 40px;
          position: absolute;
          top: -76px;
          z-index: 10;
        }
        
        &.hide-order {
          padding-bottom: 0;
          top: 0;

          .order-list-container {
            padding-bottom: 0;
          }

          .order-list {
            display: none;
            opacity: 0;
          }

          .now-order-type {
            margin-top: 30px;
          }
        }

        .order-list {
          position: relative;
          padding: 4px 0;
          border-radius: 10px;
          border: 1px solid #eaeaea;
          opacity: 1;
          transition: 0.4s opacity;
          background: rgba(255,255,255,0.4);

          div {
            padding: 3px 10px;
            cursor: pointer;
            &:hover {
              background: rgba(255,255,255,0.3);
            }
          }
        }
      }

      .more-control {
        display: inline-block;
        position: relative;

        .more-list-container {
          padding-bottom: 40px;
          position: absolute;
          width: 60px;
          top: -102px;
          left: -10px;
          z-index: 10;
        }

        .more-list {
          position: relative;
          padding: 4px 0;
          border-radius: 10px;
          border: 1px solid #eaeaea;
          opacity: 1;
          transition: 0.4s opacity;
          background: rgba(255,255,255,0.4);
          font-size: 12px;
          color: #fff;

          .iconfont {
            font-size: 16px;
          }

          div {
            padding: 5px 6px;
            cursor: pointer;
            &:hover {
              background: rgba(255,255,255,0.3);
            }
          }
        }
      }

      .volume-control {
        display: inline-block;
        position: relative;

        .volume-slider-container {
          position: absolute;
          padding-bottom: 40px;
          top: -125px;
          opacity: 1;
          transition: 0.4s opacity;
          z-index: 10;
        }

        .iconfont {
          margin: -5px 10px 0 10px;
        }

        &.hide-slider {
          top: 0;
          height: 90px;

          .iconfont {
            margin: 40px 10px;
          }
        }

        .volume-slider {
          background: rgba(255,255,255,0.4);
          border: #eaeaea 1px solid;
          padding: 15px 0;
          border-radius: 10px;
        }
      }
    }

    .progress-container {
      margin-top: 15px;
      margin-left: 15px;
      color: white;

      .song-info {
        font-size: 14px;
        display: inline-block;
        font-weight: 900;
      }

      .play-time {
        display: inline-block;
        font-size: 14px;
        font-weight: 900;
        float: right;
      }

      .progress {
        width: 700px;
        margin-top: -5px;
      }
    }

    .iconfont {
      color: White;
    }

    .el-slider__runway {
      background: white !important;
    }

    .control-btn {
      margin-top: 25px;
      margin-left: 30px;
      display: inline-block;

      >div {
        width: 50px;
      }

      .iconfont {
        font-size: 30px;
        cursor: pointer;
        line-height: 50px;
      }
    }

    .player-song-singer, .player-song-title {
      display: inline-block;
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .back-container {
      position: absolute;
      right: 0;
      width: 200px;
      height: 40px;
      bottom: 20px;

      .icon-feedback {
        position: absolute;
        left: 20px;
        top: 10px;
        color: #fff3;
        transition: 0.3s;
        cursor: pointer;

        &:hover {
          color: #fff8;
        }
      }

      .back-icon {
        position: absolute;
        right: 25px;
        bottom: 0;
        width: 150px;
        height: 40px;
        line-height: 40px;
        background: #fff1;
        transition: 0.3s;
        box-shadow: 0 0 0 #fff5;
        color: #fff5;
        font-size: 20px;
        transform: translate(110px);

        .iconfont {
          font-size: 20px;
          color: #fff5;
          transition: 0.3s;
          margin: 0 10px;
        }

        &:hover {
          box-shadow: 0 0 20px #fff5;
          transform: translate(30px);
          color: #fff8;
          .iconfont {
            color: #fff8;
          }
        }
      }
    }
  }
</style>