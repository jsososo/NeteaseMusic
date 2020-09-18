<template>
  <div class="mv-page">
    <div class="mv-info" v-if="mvInfo.id">
      <div class="mv-title">
        <a class="iconfont icon-arrow-left pr_20" href="#/" />{{mvInfo.name}}
      </div>
      <div class="mv-ar">
        {{mvInfo.ar.map((a) => a.name).join(' ')}}
        <i class="iconfont icon-mv pl_20 ft_12" />
        <span class="pl_5 ft_12">{{mvInfo.playCount}}</span>
        <span class="mv-time">{{mvInfo.publishTime}}</span>
      </div>
      <video class="video-content" :poster="mvInfo.cover" controls :src="mvInfo.url"></video>
    </div>
    <div class="recommend-list hide-scroll">
      <div ref="recommendList">
        <div class="recommend-item" :key="item.id" v-for="item in recommend" @click="changeUrlQuery({ id: item.id, from: item.platform }, '#/mv')">
          <img class="r-m-cover" :src="item.cover" alt="" />
          <div class="r-m-name" >{{item.name}}</div>
        </div>
      </div>
    </div>
    <a v-if="errMessage" class="err-message" href="#/">
      <div>{{errMessage}}</div>
      <div style="font-size: 18px;margin-top: 20px">点我返回 >_< </div>
    </a>
  </div>
</template>

<script>
  import request from '../assets/utils/request';
  import timer from '../assets/utils/timer';
  import { numToStr, changeUrlQuery } from "../assets/utils/stringHelper";

  export default {
    name: "Mv",
    data() {
      const { id, from: platform } = this.$route.query;
      return {
        id,
        platform: platform || '163',
        mvInfo: {},
        recommend: [],
        recommendHeight: 0,
        errMessage: ''
      }
    },
    watch: {
      $route(v) {
        this.id = v.query.id;
        this.platform = v.query.from || '163';
        this.queryMv();
      },
    },
    created() {
      this.$store.dispatch('updateShowCover', false);
      this.$store.dispatch('updateMode', 'mv');
      window.UPDARE_PLAYING_STATUS(false);
      this.queryMv();
    },
    mounted() {
    },

    methods: {
      async queryMv() {
        try {
          const { id, platform } = this;
          const res = await request({
            api: 'MV',
            data: { id, _p: platform },
          })
          this.errMessage = '';
          this.mvInfo = res.data;
          this.mvInfo.playCount = numToStr(this.mvInfo.playCount);
          this.mvInfo.publishTime = this.mvInfo.publishTime ? timer(this.mvInfo.publishTime).str() : '';
          this.recommend = (res.data.recommend || []);
        } catch (err) {
          this.errMessage = 'MV 找不到呀 TAT';
        }
      },
      changeUrlQuery,
    }
  }
</script>

<style scoped lang="scss">
  .mv-page {
    width: 70vw;
    margin-left: 8vw;
    color: #fffa;
    padding-top: 20px;

    .err-message {
      text-align: center;
      display: block;
      margin-top: 100px;
      font-size: 24px;
      font-weight: bold;
      padding-left: 7vw;
    }

    .mv-title {
      font-size: 18px;
      font-weight: bold;
      line-height: 20px;
      margin-bottom: 20px;
    }

    .mv-ar {
      line-height: 20px;
    }

    .mv-time {
      font-size: 12px;
      font-weight: normal;
      color: #fff8;
      display: inline-block;
      margin-left: 20px;
      line-height: 20px;
    }

    .video-content {
      display: block;
      height: calc(100vh - 230px);
      margin: 20px auto;
      border-radius: 10px;
      outline: none;
    }

    .recommend-list {
      width: 400px;
      overflow: auto;
      opacity: 0.6;
      transition: 0.3s;
      position: absolute;
      right: -180px;
      height: calc(100vh - 230px);
      top: 122px;
      transform: scale(0.75);

      &:hover {
        right: -150px;
        opacity: 0.8;
        transform: scale(1);
      }

      .recommend-item {
        width: 160px;
        vertical-align: top;
        padding: 0 15px;
        text-align: center;
        margin: 5px 0;

        .r-m-cover {
          width: 160px;
          border-radius: 5px;
          margin-bottom: 5px;
          cursor: pointer;
        }
        .r-m-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          width: 160px;
        }
      }
    }
  }
</style>