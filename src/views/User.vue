<template>
  <div class="user-page-container">
    <div class="login-container" v-if="!uid">
      <!--<div class="login-tab">-->
        <!--<div @click="changeType('password')" :class="`login-type ${type === 'password' && 'selected'}`">-->
          <!--账号密码<span style="left: -15px"></span>-->
        <!--</div>-->
        <!--<div @click="changeType('captcha')" :class="`login-type ${type === 'captcha' && 'selected'}`">-->
          <!--手机验证码<span style="left: -4px"></span>-->
        <!--</div>-->
      <!--</div>-->
      <div class="login-input-container mt_25 pt_30">
        <div class="input-line">
          <div class="input-label">
            {{type === 'password' ? '手机/邮箱' : '手机'}}
          </div>
          <input type="text" v-model="username">
        </div>
        <div class="input-line" v-if="type === 'password'">
          <div class="input-label">
            密码
          </div>
          <input type="password" v-model="password">
        </div>
        <div class="input-line" v-if="type === 'captcha'">
          <div class="input-label">
            验证码
          </div>
          <input type="text" v-model="code" style="width: 165px;">
          <div @click="sendCaptcha" :class="`code-btn ${time > 0 && 'disabled'}`">发送{{time > 0 ? `（${time}s）` : ''}}</div>
        </div>
        <div
          @click="login"
          :class="`login-btn ${(((type === 'captcha' && !code) || (type === 'password' && !password)) || !username) && 'disabled'}`"
        >登录</div>
      </div>
    </div>

    <div class="user-info-content" v-if="uInfo.userId">
      <img class="user-avatar" :src="uInfo.avatarUrl" alt="">
      <div class="user-info-list">
        <div class="user-info-txt user-info-name">
          <span class="vat">{{uInfo.nickname}}</span> <span class="user-signature">{{uInfo.signature}}</span>
        </div>
        <div class="user-info-txt user-info-follow">
          <span class="inline-block pointer" @click="selected = 'flow'">关注 {{uInfo.follows}}</span>
          <span class="inline-block ml_20 pointer" @click="selected = 'fans'">粉丝 {{uInfo.followeds}}</span>
        </div>
        <div class="user-info-txt user-info-listen pointer" @click="selected = 'history'">听过 {{uInfo.listenSongs}}</div>
        <div class="user-info-txt user-info-playlist"><a :href="`#/playlist?id=${uInfo.userId}`">歌单 {{uInfo.playlistCount}} 个</a></div>
        <div class="user-info-txt user-info-level">Lv {{uInfo.level}}</div>
      </div>

      <div class="user-right-list">
        <div class="right-select-tab-list">
          <div
            :class="`tab-item-${i} c-${t.color} ${selected === t.key && 'selected'}`"
            v-for="(t, i) in tabs"
            :key="t.icon"
            @click="selected = t.key"
          >
            <i :class="`iconfont icon-${t.icon}`" />
            {{t.val}}
          </div>
        </div>

        <!-- 听歌记录 -->
        <div class="song-list" v-if="selected === 'week' || selected === 'history'">
          <div
            v-for="(s, i) in info[selected]"
            :key="`${s}-${i}`"
            class="song-item"
            @click="playMusic(s)"
          >
            <div class="playing-bg" v-if="playNow.id === s" :style="`width: ${playingPercent * 100}%`">
              <div class="wave-bg"></div>
              <div class="wave-bg2"></div>
            </div>
            <div class="song-index">{{i+1}}</div>
            <div class="count-bg" :style="`width: ${(countMap[selected][s].count / countMap[`${selected}Max`] * 100) || countMap[selected][s].score}%`"></div>
            <div class="song-name">{{allSongs[s].name}}</div>
            <div>
              <div class="song-ar">{{allSongs[s].ar.map((a) => a.name).join('/')}}</div>
              <div class="song-operation">
                <i
                  v-if="allList[userList.favId]"
                  @click="likeMusic(s)"
                  :class="`operation-icon operation-icon-1 iconfont icon-${allList[userList.favId].indexOf(s) > -1 ? 'like' : 'unlike'}`"
                />
                <i
                  @click="playlistTracks(s, 'add', 'ADD_SONG_2_LIST')"
                  class="operation-icon operation-icon-2 iconfont icon-add"
                />
                <i
                  @click="download(s)"
                  class="operation-icon operation-icon-3 iconfont icon-download"
                />
                <span class="played-count-num" v-if="getNum(countMap[selected][s].count) > 0">{{getNum(countMap[selected][s].count)}}次</span>
              </div>
            </div>
          </div>
          <div v-if="info.week.length === 0" class="text-center mt_40">没听过没听过</div>
        </div>

        <!-- 关注、粉丝 -->
        <div class="member-list" @scroll="onScroll('.user-page-container .member-list')" v-if="selected === 'flow' || selected === 'fans'">
          <div v-for="(u, i) in uInfo[`${selected}List`]" :key="`${u.userId}-${i}`" class="member-item" >
            <a :href="`#/user?id=${u.userId}`">
              <img class="member-img" :src="`${String(u.avatarUrl) === 'null' ? 'http://p3.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg' : u.avatarUrl}?param=120y120`"  />
              <div class="member-name">{{u.nickname}}</div>
            </a>
          </div>
          <div class="text-center mt_40" v-if="uInfo[`${selected}List`] && uInfo[`${selected}List`].length === 0">空空如也～</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import request, { loginStatus, likeMusic, handleSongs, download } from '../assets/utils/request';
  import Num from '../assets/utils/num';
  import $ from 'jquery';
  export default {
    name: "User",
    data() {
      return {
        username: '',
        password: '',
        code: '',
        type: 'password',
        time: 0,
        tabs: [
          {
            icon: 'week',
            key: 'week',
            color: 'red',
            val: '最近常听'
          },
          {
            icon: 'history',
            key: 'history',
            color: 'blue',
            val: '历史排行',
          },
          {
            icon: 'flow',
            key: 'flow',
            color: 'yellow',
            val: '关注',
          },
          {
            icon: 'fans',
            key: 'fans',
            color: 'green',
            val: '粉丝',
          }
        ],
        info: {
          week: [],
          history: [],
        },
        countMap: {
          history: {},
          week: {},
          weekMax: 0,
          historyMax: 0,
        },
        uInfo: {},
        selected: 'week',
      }
    },
    computed: {
      ...(mapGetters({
        user: 'getUser',
        allList: 'getAllList',
        userList: 'getUserList',
        allSongs: 'getAllSongs',
        playNow: 'getPlaying',
      }))
    },
    watch: {
      time(v) {
        if (v > 0) {
          setTimeout(() => {
            if (this.time > 0) {
              this.time -= 1;
            }
          }, 1000);
        }
      },
      username() {
        this.time = 0;
      },
      user(v) {
        if (v.userId && (!v.listenSongs || !v.nickname)) {
          if (!this.$route.query.id) {
            this.uid = v.userId;
            this.getUserDetail();
            this.getRecord(1);
          }
        }
      },
      selected(v) {
        switch (v) {
          case 'week':
            return this.getRecord(1);
          case 'history':
            return this.getRecord();
          case 'flow':
          case 'fans':
            return this.getMemberList(v);
        }
      },
      $route(){
        this.uid = this.$route.query.id;
        if (!this.uid) {
          this.uid = this.user.userId;
        }
        if (this.uid) {
          this.getUserDetail(this.uid);
          this.getRecord(1);
        }
      },
    },
    created() {
      if (this.user.userId) {
        this.uid = this.user.userId;
      }
      if (this.$route.query.id) {
        this.uid = this.$route.query.id;
      }
      if (this.uid !== this.uInfo.userId) {
        this.getUserDetail();
        this.getRecord(1);
      }

      this.$store.dispatch('updateShowCover', false);
    },
    methods: {
      changeType(t) {
        this.type = t;
      },
      async getUserDetail() {
        const { uid } = this;
        const { level, listenSongs, profile } = await request({ api: 'GET_USER_DETAIL', data: { uid }});
        if (uid === this.user.userId) {
          this.$store.dispatch('setUser', { ...profile, listenSongs, level});
        }
        this.uInfo = { ...profile, listenSongs, level };
        if (['flow', 'fans'].indexOf(this.selected) > -1) {
          this.getMemberList(this.selected);
        }
      },
      async sendCaptcha() {
        const res = await request({ api: 'CAPTCH_SENT', data: { phone: this.username }});
        if (res) {
          this.time = 60;
        }
      },
      async login() {
        const { username, password, code, type } = this;
        if (type === 'password') {
          const params = {
            password,
          };
          let api = '163_LOGIN_PHONE';
          if (username.match(/@/)) {
            api = '163_LOGIN_EMAIL';
            params.email = username;
          } else {
            params.phone = username;
          }
          request({ api, data: params, method: 'post' })
            .then((res) => {
              if (res) {
                loginStatus();
              } else {
                this.$message.error('账号密码错误');
              }
            }, () => this.$message.error('账号密码错误'))

        } else {
          const res = await request({ api: 'CAPTCH_VERIFY', data: { phone: username, captcha: code }});
          if (res) {
            this.$message.success('登录成功');
            loginStatus();
          }
        }
      },

      async getRecord(type = 0, uid = this.uid) {
        if (!uid) {
          return;
        }
        const res = await request({
          api: 'GET_USER_RECORD',
          data: {
            uid,
            type,
          }
        });
        if (!res) {
          return;
        }
        const list = res[['allData', 'weekData'][type]];
        const key = ['history', 'week'][type];
        const ids = [];
        const songs = list.map((item) => {
          const id = item.song.id;
          this.countMap[key][id] = {
            count: item.playCount,
            score: item.score,
          };
          ids.push(id);
          return item.song;
        });
        this.countMap[`${key}Max`] = (list[0] || { count: 0 }).playCount;

        await handleSongs(songs);

        this.info[key] = ids;
      },

      getNum(v) {
        if (v > 10000) {
          return `${Num(v / 10000, 2)}w`;
        }
        if (v > 1000) {
          return `${Num(v / 1000, 2)}k`;
        }
        return v;
      },

      // 获取关注或粉丝列表
      getMemberList(type) {
        const { uid } = this;
        if (!uid) {
          return;
        }
        const key = `${type}List`;
        if (!this.uInfo[`${type}More`] && this.uInfo[key]) {
          return;
        }
        const oldList = this.uInfo[key] || [];
        request({
          api: {
            flow: 'GET_FOLLOWS',
            fans: 'GET_FOLLOWEDS',
          }[type],
          data: {
            uid,
            limit: 30,
            offset: oldList.length,
          }
        }).then((res) => {
          const keyMap = {
            flow: 'follow',
            fans: 'followeds',
          };
          this.uInfo = {
            ...this.uInfo,
            [key]: [ ...oldList, ...res[keyMap[type]] ],
            [`${type}More`]: res.more,
          }
        })
      },

      onScroll(cls) {
        const el = $(cls);
        const viewH = el.height(); // 可见高度
        const contentH = el.get(0).scrollHeight; // 内容高度
        const scrollTop = el.scrollTop(); // 滚动高度
        if (contentH - viewH - scrollTop < 150) {
          this.getMemberList(this.selected);
        }
      },

      likeMusic: likeMusic,
      playlistTracks(tracks, op, type) {
        window.event.stopPropagation();
        this.$store.dispatch('setOperation', { data: { tracks, op }, type });
      },
      playMusic(id) {
        const { dispatch } = this.$store;
        const { allSongs, info, selected } = this;
        const song = allSongs[id];
        if (!song.url) {
          return;
        }
        dispatch('updatePlayNow', song);
        dispatch('updatePlayingList', { list: info[selected] });
        dispatch('updatePlayingStatus', true);
      },
      download,
    },
  }
</script>

<style lang="scss" scoped>
  .user-page-container {
    .login-container {
      position: absolute;
      height: 400px;
      border-radius: 30px;
      background: #0002;
      width: 60%;
      margin-left: 20%;
      color: #fffa;

      .login-tab {
        width: 50%;
        margin-left: 25%;
        margin-top: 20px;
        line-height: 30px;
        height: 40px;
        margin-bottom: 40px;

        .login-type {
          display: inline-block;
          width: 50%;
          font-weight: bold;
          color: #fff8;
          transition: 0.3s;
          position: relative;
          font-size: 22px;
          cursor: pointer;

          span {
            display: inline-block;
            width: 0;
            white-space: nowrap;
            transition: 0.3s;
            border-bottom: 12px solid #409EFF00;
            vertical-align: 20px;
            position: absolute;
            top: 16px;
            z-index: 0;
          }

          &:hover, &.selected {
            color: #fffc;
            font-size: 26px;

            span {
              width: 140px;
              border-bottom: 12px solid #409EFF55;
            }
          }
          &.selected {
            span {
              border-bottom: 12px solid #409EFF99;
            }
          }
        }
      }

      .input-line {
        width: 420px;
        margin-top: 20px;
        margin-left: calc(50% - 310px);

        .input-label {
          width: 100px;
          display: inline-block;
          font-size: 20px;
          text-align: right;
        }

        input {
          background: transparent !important;
          border: transparent;
          border-bottom: 1px solid rgba(255,255,255, 0.5) !important;
          color: white;
          font-size: 20px;
          outline: none !important;
          width: 285px;
          vertical-align: 0;
          margin-left: 20px;
        }

        .code-btn {
          width: 115px;
          display: inline-block;
          vertical-align: 5px;
          border: 1px dashed #fff8;
          text-align: center;
          height: 32px;
          line-height: 32px;
          border-radius: 5px;
          transition: 0.3s;
          cursor: pointer;

          &:hover {
            border: 1px dashed #fff;
          }
          .disabled {
            border: 1px dashed #fff8;
            cursor: not-allowed;
          }
        }
      }

      .login-btn {
        width: 285px;
        border: 1px dashed #fff8;
        margin-left: calc(50% - 190px);
        border-radius: 5px;
        height: 40px;
        line-height: 40px;
        margin-top: 20px;
        text-align: center;
        font-weight: bold;
        font-size: 22px;
        letter-spacing: 20px;
        transition: 0.3s;
        cursor: pointer;
        
        &:hover {
          border: 1px dashed #fff8;
          color: #fffc;
        }
        &.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .user-info-content {
      .user-info-list {
        padding-left: 280px;
        padding-top: 40px;
        position: absolute;
        z-index: 2;
      }
      .user-avatar {
        width: 290px;
        height: 290px;
        border-radius: 50%;
        opacity: 0.4;
        position: absolute;
        top: 60px;
        left: 110px;
        z-index: 1;
      }

      .user-info-txt {
        color: #fffc;
        font-weight: bold;
        text-shadow: 0 2px 10px #000c;
        margin-bottom: 10px;
      }
      .user-info-name {
        font-size: 32px;
        max-width: 500px;

        .user-signature {
          font-size: 14px;
          display: inline-block;
          padding-left: 20px;
          font-weight: normal;
          max-width: 300px;
        }
      }
      .user-info-follow {
        font-size: 28px;
        padding-left: 15px;
      }
      .user-info-listen {
        font-size: 26px;
        padding-left: 30px;
      }
      .user-info-playlist {
        font-size: 24px;
        padding-left: 45px;
      }
      .user-info-level {
        font-size: 22px;
        padding-left: 60px;
      }
    }

    .user-right-list {
      width: 40%;
      background: #0003;
      border-left: 1px solid #fff8;
      box-sizing: border-box;
      display: inline-block;
      vertical-align: top;
      position: absolute;
      right: 20px;
      top: 20px;
      color: #fffc;
      height: calc(100vh - 120px);

      .song-list, .member-list {
        height: calc(100vh - 120px);
        box-sizing: border-box;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 0;
          height:8px;
          background-color:rgba(0,0,0,0);
        }
      }

      .song-list {

        .song-item {
          height: 55px;
          position: relative;
          border-bottom: 1px solid #fff3;
          overflow: hidden;
          transition: 0.3s;
          box-sizing: border-box;

          .count-bg {
            height: 100%;
            position: absolute;
            background: #67C23A33;
            left: 0;
            top: 0;
            z-index: 0;
          }

          &:hover {
            background: #0003;

            .song-name {
              font-weight: bold;
              font-size: 20px;
            }

            .song-ar {
              opacity: 0.3;
            }

            .operation-icon {
              font-size: 16px;
            }
          }

          div {
            box-sizing: border-box;
          }

          .song-index {
            position: absolute;
            font-size: 60px;
            line-height: 80px;
            font-weight: bold;
            color: #fff2;
          }

          .song-name {
            display: inline-block;
            width: 55%;
            vertical-align: top;
            position: absolute;
            top: 10px;
            left: 40px;
            transition: 0.3s;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .song-ar {
            vertical-align: top;
            display: inline-block;
            width: 30%;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            position: absolute;
            bottom: 5px;
            opacity: 0.6;
            left: 40px;
            font-size: 12px;
            transition: 0.3s;
          }
        }

        @for $i from 1 to 4 {
          .operation-icon-#{$i} {
            position: absolute;
            bottom: 20px;
            left: calc(60% + #{$i * 30}px);
            cursor: pointer;
            font-size: 14px !important;
            transition: 0.3s;
          }
        }

        .played-count-num {
          position: absolute;
          bottom: 15px;
          font-weight: bold;
          right: 30px;
          color: #fff8;
        }
      }

      .member-list {
        .member-item {
          position: relative;
          width: 25%;
          box-sizing: border-box;
          display: inline-block;
          vertical-align: top;
          margin-bottom: 20px;
          text-align: center;
          cursor: pointer;
          transition: 0.3s;
          opacity: 0.7;

          &:hover {
            opacity: 1;
          }

          .member-img {
            width: 60%;
            border-radius: 50%;
            margin-top: 20px;
          }

          .member-name {
            padding-top: 10px;
            color: #fff8;
          }
        }
      }
    }
  }
</style>