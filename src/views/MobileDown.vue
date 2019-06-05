<template>
  <div class="text-center m-d-page">
    <div class="info-txt">如果下载的歌名异常可尝试点击下载</div>
    <div>
      点击下载：
      <a :href="url" :download="query.n" class="song-title">{{query.n}}</a></div>
    <div class="mt_20">
      <el-progress :width="140" type="circle" :percentage="progress.percent"></el-progress>
      <div>{{progress.current}} / {{progress.total}} MB</div>
    </div>
  </div>
</template>

<script>
  import { getQueryFromUrl } from "../assets/utils/stringHelper";
  import down from '../assets/utils/download';
  import Storage from '../assets/utils/Storage';
  import request from '../assets/utils/request';
  import Num from '../assets/utils/num';

  export default {
    name: "MobileDown",
    data() {
      return {
        query: getQueryFromUrl(),
        url: '',
        progress: {
          percent: 0,
          current: 0,
          total: 0,
        },
        downing: false,
      }
    },
    created() {
      this.query.n = this.query.n.replace(/%2F/ig, '/');
      request.getQQVkey(() => this.getDownLoad())
    },
    methods: {
      getDownLoad() {
        if (this.downing) {
          return;
        }
        this.downing = true;
        const { murl, vkey, guid } = Storage.get(['murl', 'vkey', 'guid']);
        this.url = `${murl}${this.query.u}?vkey=${vkey}&guid=${guid}&fromtag=8&uin=0`;
        down(this.url
          , this.query.n, this.query.c, {
          progress: (percent, current, total) => {
            this.progress = {
              percent: Num(percent * 100, 2),
              current: Num(current / 1024 / 1024, 2),
              total: Num(total / 1024 / 1024, 2),
            }
          }
        });
      }
    }
  }
</script>

<style lang="scss">
  .m-d-page {
    color: #fff;
    padding: 100px 10vw;
    font-weight: bold;
    font-size: 4vw;
    width: 80vw;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    background: url("../assets/img/bg-1.png") no-repeat;
    background-size: cover;
    z-index: 10000;

    .info-txt {
      font-size: 3vw;
      margin-bottom: 20px;
      opacity: 0.6;
    }
    
    .el-progress__text {
      color: #fff !important;
    }

    .song-title {
      color: #fff;
      text-decoration: #fff underline;
      cursor: pointer;
    }
  }
</style>