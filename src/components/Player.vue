<template>
  <div class="player-container">
    <div v-if="showControl && playNow.id && allSongs[playNow.id]">
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
          <i class="el-icon-loading mr_10" v-if="loading || downloading" />
          <span class="player-song-title pointer" @click="goTo('#/')">{{playNow.name}}</span>
          <span class="player-song-singer pl_20 pointer">
            <a v-for="a in allSongs[playNow.id].ar" :key="a.id" :href="`#/singer?id=${a.id}`">{{a.name}} </a>
          </span>
          <span
            v-if="allList[userList.favId]"
            @click="likeMusic(playNow.id)"
            style="margin-left: 25px; cursor: pointer;"
            :class="allList[userList.favId].indexOf(playNow.id) > -1 ? 'iconfont icon-like iconfont' : 'iconfont icon-unlike'">
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
                @change="changeVolume"
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
        <div class="inline-block ml_5 pd_5">
          <span @click="down(playNow.id)">
            <i class="iconfont icon-download ft_16 pointer" />
          </span>
        </div>

        <!-- 添加到歌单 -->
        <div class="inline-block ml_5 pd_5" v-if="!playNow.from">
          <span @click="playlistTracks(playNow.id, 'add', 'ADD_SONG_2_LIST')">
            <i class="iconfont icon-add ft_16 pointer" />
          </span>
        </div>

        <input id="cp-share-input" :value="`http://music.jsososo.com/#/?mid=${playNow.id}`">
        <!-- 分享 -->
        <div v-if="!playNow.from" class="inline-block ml_5 pd_5">
          <span @click="copyUrl">
            <i class="iconfont icon-share ft_16 pointer" />
          </span>
        </div>



        <div class="back-icon pointer" @click="goBack">
          <i class="iconfont icon-arrow-left" />
          BACK
        </div>

      </div>
    </div>
    <audio id="m-player" :src="playNow.url || '/error'" controls></audio>
  </div>
</template>

<script>
  import Num from '../assets/utils/num';
  import Storage from '../assets/utils/Storage';
  import { mapGetters } from 'vuex';
  import request, { getQQVkey, likeMusic, download, getPersonFM, handleQQComments } from '../assets/utils/request';
  import { handleLyric, getQueryFromUrl, changeUrlQuery } from "../assets/utils/stringHelper";
  import ArrayHelper from '../assets/utils/arrayHelper';
  import timer from '../assets/utils/timer';

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
      }),
    },
    watch: {
      async playNow(v) {
        const { listId, playingId, playerInfo, isPersonFM, playingList, playingPlatform } = this;
        const { id, lyric, name, comments, qqId, url, mid, songid } = v;
        const { murl, guid, vkey, vkey_expire } = Storage.get(['murl', 'guid', 'vkey', 'vkey_expire']);
        const dispatch = this.$store.dispatch;
        if (isPersonFM && (playingList.index >= (playingList.raw.length - 2))) {
          this.getPersonFM();
        }
        if (id == playingId) {
           // 如果是因为评论、歌词的更新，就不在走下面的步骤了
          return;
        }

        // 网易云的听歌打卡
        if (playerInfo.current > 0 && playingPlatform === '163') {
          let sourceid = (listId === 'daily' ? '' : listId) || '';
          if (!sourceid) {
            sourceid = this.allSongs[playingId].al.id;
          }
          // 听歌打卡
          request({
            api: 'SCROBBLE',
            data: {
              id: playingId,
              sourceid,
              time: Num(playerInfo.current),
            }
          })
        }

        if (qqId) {
          const newUrl = `${murl}M500${qqId}.mp3?guid=${guid}&vkey=${vkey}&fromtag=8&uin=0`;
          if (url !== newUrl) {
            dispatch('updateSongDetail', { id, url: newUrl });
          }
        }
        if (timer().str('YYYYMMDDHHmm') > vkey_expire) {
          getQQVkey();
        }
        dispatch('updatePlayingPercent', 0);
        document.title = name;
        this.currentTime = 0;
        this.playingId = id;
        this.playingPlatform = v.from || '163';
        this.listId = this.playingListId;

        // 更新后面的背景
        document.getElementById('play-music-bg').src = (this.allSongs[v.id] && this.allSongs[v.id].al && (`${this.allSongs[v.id].al.picUrl}?param=1440y1440`)) || '';

        // 没有歌词的拿歌词
        if (!lyric) {
          if (v.from === 'qq') {
            request({
              api: 'QQ_LYRIC',
              data: { songmid: mid },
            }).then((res) => {
              const { lyric, trans } = res.data;
              const lyricObj = {};
              handleLyric(lyric, 'str', lyricObj);
              handleLyric(trans, 'trans', lyricObj);
              dispatch('updateSongDetail', { id, lyric: lyricObj });
            })
          } else {
            request({ api: 'GET_LYRIC', data: { id }, cache: true })
              .then((res) => {
                const { nolyric, lrc = {}, tlyric = {} } = res;
                let lyric = {};
                if (nolyric) {
                  lyric = {
                    0: {
                      str: '没有歌词哟，好好享受',
                    },
                  }
                } else {
                  handleLyric(lrc.lyric, 'str', lyric);
                  handleLyric(tlyric.lyric, 'trans', lyric);
                }
                dispatch('updateSongDetail', { id, lyric });
              })
          }
        }

        // 没有评论的拿评论
        if (!comments) {
          if (v.from === 'qq') {
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
              dispatch('updateSongDetail', { id, comments });
            })
          } else {
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
              console.log(comments);
              dispatch('updateSongDetail', { id, comments });
            })
          }
        }
      },
    },
    mounted() {
      this.playerDom = document.getElementById('m-player');
      this.playerDom.volume = Storage.get('volume') || 1;
      // 初始化音量
      this.volume = (Storage.get('volume') || 1) * 100;

      // audio标签
      const pDom = this.playerDom;
      // slider，进度条
      const sDom = document.getElementsByClassName('el-slider__button el-tooltip')[0];
      const dispatch = this.$store.dispatch;
      window.onhashchange = () => this.showControl = !getQueryFromUrl('hideControl');

      // audio加载完成
      pDom.oncanplaythrough = () => {
        if (this.playing && this.playNow.url === pDom.src) {
          pDom.play();
        }
        dispatch('setDownLoading', false);
        this.playerInfo = { duration: pDom.duration, current: 0 };
        dispatch('updatePlayingPercent', 0);
      };
      // 如果不播放了可能是url过期了
      pDom.onerror = () => {
        const { id } = this.playNow;
        if (!id) {
          return;
        }
        dispatch('setDownLoading', true)
        request({ api: 'SONG_URL', data: { id }})
          .then((res) => {
            const { url, br } = res.data[0];
            if (!url) {
              return this.cutSong('playNext');
            }
            dispatch('updateSongDetail', { url, br, id });
          });
      };
      // audio正在加载音乐
      pDom.onwaiting = () => dispatch('setDownLoading', true);
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
      window.onkeydown = ({ keyCode, path, ctrlKey, altKey, shiftKey }) => {
        // 输入框内的操作，忽略掉
        if (['textarea', 'input'].indexOf(path[0].nodeName.toLowerCase()) > -1) {
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
        this.playerDom[['pause', 'play'][Number(status)]]();
        this.$store.dispatch('updatePlayingStatus', status);
      },
      // 切歌。包括上一首。下一首
      cutSong(type) {
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
    }
  }
</script>

<style lang="scss">
  audio {
    display: none !important;
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

    .back-icon {
      position: absolute;
      right: 25px;
      bottom: 20px;
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
</style>