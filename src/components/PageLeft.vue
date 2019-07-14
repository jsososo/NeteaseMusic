<template>
  <div class="page-left-nav">
    <div class="left-nav-bg"></div>
    <div class="avatar nav-line">
      <img class="avatar-img iconfont" @click="goToUser" v-if="user.avatarUrl" :src="user.avatarUrl" />
      <img class="avatar-img iconfont" @click="goToUser" src="../assets/img/u-no-avatar.png" v-if="!user.avatarUrl">
      <div class="icon-text" @click="goToUser">{{user.userId ? user.nickname : '来登陆呀'}}</div>
    </div>
    <div class="nav-line">
      <a href="#/search">
        <i class="iconfont icon-search"></i>
        <div class="icon-text">寻觅</div>
      </a>
    </div>
    <div class="nav-line">
      <a href="#/playlist">
        <i class="iconfont icon-playlist"></i>
        <div class="icon-text">歌单</div>
      </a>
    </div>
    <div class="nav-line">
      <a href="#/recommend">
        <i class="iconfont icon-recommend"></i>
        <div class="icon-text">推荐</div>
      </a>
    </div>
    <div class="nav-line">
      <a href="#/about">
        <i class="iconfont icon-version"></i>
        <div class="icon-text">关于</div>
      </a>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    name: "PageLeft",
    computed: {
      ...mapGetters({
        user: 'getUser',
      })
    },
    created() {

    },
    methods: {
      goToUser() {
        window.location = '#/user';
      }
    }
  }
</script>

<style lang="scss">
  .page-left-nav {
    position: absolute;
    left: 0;
    top: 0;
    width: 40px;
    padding: 0 10px;
    transition: 0.3s;
    overflow: hidden;
    color: #fff;
    height: 100%;
    font-size: 18px;
    font-weight: bold;
    border-radius: 0;
    opacity: 0.4;
    z-index: 100;

    .left-nav-bg {
      background: -webkit-linear-gradient(top, #fff8, #fff6, #fff0, #fff0);
      height: 200%;
      top: -50%;
      position: absolute;
      right: 0;
      width: 400px;
      transition: 0.3s;
    }

    &:hover {
      width: 270px;
      opacity: 1;

      .left-nav-bg {
        background: -webkit-linear-gradient(top, #ccc9, #ccc9, #ccc5, #ccc0, #ccc0, #ccc0);
        border-radius: 0 100% 200% 0;
      }

      .iconfont {
        opacity: 1;
      }
      .avatar {
        .avatar-img {
          width: 50px;
          height: 50px;
        }
      }
    }

    .avatar {
      margin-top: 30px;
      opacity: 0.8;

      .avatar-img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
    }
    .nav-line {
      width: 500px;
      line-height: 40px;
      height: 40px;
      margin-bottom: 20px;
      cursor: pointer;

      a {
        color: #fff !important;
      }

      &:hover {
        .iconfont {
          font-size: 36px;
          &.img {
            width: 50px;
            height: 50px;
          }
        }
        .icon-text {
          font-size: 22px;
        }
      }

      .iconfont {
        display: inline-block;
        vertical-align: top;
        font-size: 30px;
        font-weight: 100;
        opacity: 0.8;
        transition: 0.3s;
        width: 40px;
        text-align: center;
      }
      .icon-text {
        display: inline-block;
        vertical-align: top;
        opacity: 0.8;
        transition: 0.3s;
        padding-left: 20px;
        width: 300px;
      }
    }
  }
</style>