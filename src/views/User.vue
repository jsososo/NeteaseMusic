<template>
  <div class="user-page-container">
    <div class="login-container" v-if="!user.userId">
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

    <div class="user-info-content" v-if="user.userId">
      <div class="user-info-list">
        <img class="user-avatar" :src="user.avatarUrl" alt="">
        <div class="user-info-txt user-info-name">
          {{user.nickname}} <span class="ft_18 pl_20">{{user.signature}}</span>
        </div>
        <div class="user-info-txt user-info-follow">
          <span class="inline-block">关注 {{user.follows}}</span>
          <span class="inline-block ml_20">粉丝 {{user.followeds}}</span>
        </div>
        <div class="user-info-txt user-info-listen">听过 {{user.listenSongs}}</div>
        <div class="user-info-txt user-info-level">Lv {{user.level}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import request, { loginStatus } from '../assets/utils/request';
  export default {
    name: "User",
    data() {
      return {
        username: '',
        password: '',
        code: '',
        type: 'password',
        time: 0,
      }
    },
    computed: {
      ...(mapGetters({
        user: 'getUser',
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
        if (v.userId && !v.listenSongs) {
          this.getuserDetail();
        }
      },
    },
    created() {
      if (this.user.userId && !this.user.listenSongs) {
        this.getuserDetail();
      }
      this.$store.dispatch('updateShowCover', false);
    },
    methods: {
      changeType(t) {
        this.type = t;
      },
      async getuserDetail() {
        const { level, listenSongs, profile } = await request({ api: 'GET_USER_DETAIL', data: { uid: this.user.userId }});
        this.$store.dispatch('setUser', { ...profile, listenSongs, level});
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
          request({ api, data: params, methods: 'post' })
            .then((res) => {
              if (res) {
                loginStatus();
              }
            }, () => this.$message.error('账号密码错误'))

        } else {
          const res = await request({ api: 'CAPTCH_VERIFY', data: { phone: username, captcha: code }});
          if (res) {
            this.$message.success('登录成功');
            loginStatus();
          }
        }
      }
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
      }
      .user-avatar {
        width: 280px;
        height: 280px;
        border-radius: 50%;
        opacity: 0.4;
        position: absolute;
        top: 50px;
        left: 100px;
      }

      .user-info-txt {
        color: #fffc;
        font-weight: bold;
        text-shadow: 0 2px 10px #000c;
        margin-bottom: 10px;
      }
      .user-info-name {
        font-size: 32px;
      }
      .user-info-follow {
        font-size: 28px;
        padding-left: 15px;
      }
      .user-info-listen {
        font-size: 26px;
        padding-left: 30px;
      }
      .user-info-level {
        font-size: 24px;
        padding-left: 45px;
      }
    }
  }
</style>