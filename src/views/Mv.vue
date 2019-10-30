<template>
  <div class="mv-page">
    <div class="mv-info" v-if="mvInfo.id">
      <div class="mv-title">
        {{mvInfo.name}}
      </div>
      <div class="mv-ar">
        {{mvInfo.artists.map((a) => a.name).join(' ')}}
        <i class="iconfont icon-mv pl_20 ft_12" />
        <span class="pl_5 ft_12">{{mvInfo.playCount}}</span>
        <span class="mv-time">{{mvInfo.publishTime}}</span>
      </div>
      <video class="video-content" controls :src="mvInfo.url"></video>
    </div>
    <div class="recommend-list hide-scroll">
      <div class="recommend-item" :key="item.id" v-for="item in recommend">
        <img class="r-m-cover" @click="changeUrlQuery({ id: item.id, from: item.from }, '#/mv')" :src="item.cover" alt="" />
        <div class="r-m-name" @click="changeUrlQuery({ id: item.id, from: item.from }, '#/mv')" >{{item.name}}</div>
      </div>
    </div>
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

    methods: {
      async queryMv() {
        const { id, platform } = this;
        if (platform === '163') {
          const res = await request({
            api: 'GET_MV_INFO',
            data: { mvid: id }
          });

          const { name, artists, brs, publishTime, playCount } = res.data;
          const url = Object.values(brs).pop();
          this.mvInfo = {
            name,
            artists,
            url,
            publishTime: timer(publishTime).str('YY-MM-DD'),
            playCount: numToStr(playCount),
            id,
          };

          const simiRes = await request({
            api: 'GET_SIMI_MV',
            data: { mvid: id },
          });

          this.recommend = simiRes.mvs;
        }

        if (platform === 'qq') {
          const res = await request({
            api: 'QQ_MV_INFO',
            data: { id }
          });

          const { name, singers: artists, pubdate, playcnt } = res.data.info;

          this.recommend = res.data.recommend.map(({ cover_pic, name, vid }) => ({
            name,
            id: vid,
            cover: cover_pic,
            from: 'qq',
          }));

          const urlRes = await request({
            api: 'QQ_MV_URL',
            data: { id },
          });
          const url = urlRes.data[id].pop();

          this.mvInfo = {
            name,
            artists,
            publishTime: timer(pubdate * 1000).str('YY-MM-DD'),
            playCount: numToStr(playcnt),
            id,
            url,
          };
        }
      },
      changeUrlQuery,
    }
  }
</script>

<style scoped lang="scss">
  .mv-page {
    width: 70vw;
    margin-left: 15vw;
    color: #fffa;
    padding-top: 20px;

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
      height: 37vw;
      margin: 20px auto;
      border-radius: 10px;
      outline: none;
    }

    .recommend-list {
      width: 70vw;
      overflow: auto;
      white-space: nowrap;
      opacity: 0.6;
      transition: 0.3s;

      &:hover {
        opacity: 0.8;
      }

      .recommend-item {
        width: 210px;
        display: inline-block;
        vertical-align: top;
        padding: 0 15px;
        text-align: center;

        &:first-child {
          padding-left: 0;
        }

        .r-m-cover {
          height: 100px;
          border-radius: 5px;
          margin-bottom: 5px;
          cursor: pointer;
        }
        .r-m-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
        }
      }
    }
  }
</style>