<template>
  <div class="radio-page">
    <div class="cate-list" @mouseover="showCateList = true" @mouseleave="showCateList = false">
      <div
        :class="`cate-item ${cate.id == selectCate && 'selected'} ${showCateList && 'show'}`"
        v-for="cate in cateList"
        :key="cate.id"
        @click="goTo(`#/radio?cate=${cate.id}`)"
      >
        <img
          class="cate-img"
          :src="cate.pic96x96Url"
        />
        <span class="cate-name">{{cate.name}}</span>
      </div>
    </div>
    <div :class="`radio-list ${showCateList && 'show-cate'}`">
      <div class="text-center mt_30" v-if="!radioList.length && !radioId">
        空空如也！
      </div>
      <div v-if="!radioId" class="radio-item" v-for="radio in radioList" :key="radio.id" @click="changeUrlQuery({ cate: selectCate, id: radio.id })">
        <img :src="`${radio.picUrl}?param=100y100`" class="radio-cover" />
        <div class="radio-name">{{radio.name}}</div>
      </div>
      
      <div v-if="radioId && radioDetail.id" class="radio-detail">
        <div class="radio-info">
          <img class="radio-cover" :src="radioDetail.picUrl" />
          <div class="radio-info-detail">
            <div class="radio-title">{{radioDetail.name}}</div>
            <div class="radio-author" v-if="radioDetail.dj">By: <a :href="`#/user?id=${radioDetail.dj.userId}`">{{radioDetail.dj.nickname}}</a></div>
            <div class="radio-desc">{{radioDetail.desc}}</div>
          </div>
        </div>
        <div class="radio-songs-list">
          <div class="radio-song-item" v-if="allSongs[s]" v-for="s in radioSongs" :key="allSongs[s].id">
            <img class="song-cover" :src="`${allSongs[s].coverUrl}?param=100y100`">
            <div class="song-info">
              <div class="song-name">{{allSongs[s].name}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { changeUrlQuery } from "../assets/utils/stringHelper";
  import request from '../assets/utils/request';
  import { getSongsDetail } from "../assets/utils/request";

  export default {
    name: "Radio",
    data() {
      return {
        cateList: [],
        selectCate: '',
        showCateList: false,
        radioList: [],
        radioId: '',
        radioDetail: {},
        radioSongs: [],
      }
    },
    computed: {
      ...mapGetters({
        user: 'getUser',
        allSongs: 'getAllSongs',
      })
    },
    watch: {
      $route(v) {
        this.selectCate = v.query.cate;
        this.radioId = v.query.id;
      },
      selectCate(v) {
        console.log(v, 'cate');
        v && this.getRadioList(v);
      },
      radioId(v) {
        console.log(v, 'radioId');
        v && this.getRadioDetail(v);
      },
    },
    created() {
      this.radioId = this.$route.query.id;
      request('GET_DJ_CATE_LIST')
        .then((res) => {
          if (res.categories && res.categories.length > 0) {
            this.cateList = res.categories;
            this.selectCate = this.$route.query.cate || res.categories[0].id;
          }
        })
    },
    methods: {
      getRadioList(type = this.selectCate) {
        this.radioId = this.$route.query.id || '';

        request({
          api: 'GET_DJ_RECOMMEND',
          data: { type, limit: 20 },
        }).then((res) => {
          if (res.djRadios && res.djRadios.length > 0) {
            this.radioList = res.djRadios;
          }
        })
      },
      getRadioDetail(rid) {
        this.radioId = rid;
        request({
          api: 'GET_DJ_DETAIL',
          data: { rid }
        }).then((res) => {
          this.radioDetail = res.djRadio;
          console.log(this.radioDetail);
        });
        request({
          api: 'GET_DJ_SONGS',
          data: { rid, limit: 100 },
        }).then((res) => {
          this.radioSongs = res.programs.map((s) => s.id);
          getSongsDetail(this.radioSongs);
        })
      },
      goTo(url) {
        window.location = url;
      },
      changeUrlQuery,
    }
  }
</script>

<style lang="scss" scoped>
  .radio-page {
    position: absolute;
    width: 40%;
    right: 0;
    top: 20px;
    height: (calc(100% - 40px));
    color: #fffc;
    border-radius: 10px;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 0;
      height:8px;
      background-color:rgba(0,0,0,0);
    }

    .cate-list {
      height: 100%;
      overflow: auto;
      background: #fff1;

      &::-webkit-scrollbar {
        width: 0;
        height:8px;
        background-color:rgba(0,0,0,0);
      }

      .cate-item {
        line-height: 25px;
        vertical-align: top;
        transition: 0.3s;
        opacity: 0.4;
        cursor: pointer;
        padding: 5px;


        &.selected {
          opacity: 1;
        }

        &.show {
          .cate-name {
            opacity: 1;
          }
        }

        &:hover {
          opacity: 0.8;
        }

        .cate-name {
          vertical-align: top;
          padding-left: 20px;
          opacity: 0;
          transition: 0.3s;
        }

        .cate-img {
          height: 22px;
        }
      }
    }

    .radio-list {
      position: absolute;
      top: 0;
      transition: 0.3s;
      transform: translate(40px);
      height: 100%;
      width: 100%;
      background: #fff2;
      overflow: auto;

      &::-webkit-scrollbar {
        width: 0;
        height:8px;
        background-color:rgba(0,0,0,0);
      }

      &.show-cate {
        transform: translate(140px);
      }

      .radio-item {
        display: inline-block;
        width: 35%;
        margin: 10px 5%;
        vertical-align: top;
        text-align: center;
        cursor: pointer;

        .radio-cover {
          opacity: 0.6;
          border-radius: 20px;
          transition: 0.3s;
          box-shadow: 0 0 0 #0005;
        }

        .radio-name {
          opacity: 0.6;
          transition: 0.3s;
        }

        &:hover {
          .radio-cover {
            border-radius: 10px;
            box-shadow: 10px 10px 10px #0005;
            opacity: 1;
          }

          .radio-name {
            opacity: 1;
            box-shadow: 0 0 0 #0005;
            text-shadow: 10px 10px 10px #0005;
          }
        }
      }
    }

    .radio-detail {
      .radio-info {
        padding: 20px;
        border-bottom: 1px solid #0003;
        box-shadow: 0 5px 10px #0003;

        .radio-cover {
          width: 100px;
          height: 100px;
          border-radius: 10px;
          display: inline-block;
        }

        .radio-info-detail {
          display: inline-block;
          margin-left: 20px;
          width: 300px;
          vertical-align: top;

          .radio-title {
            font-size: 18px;
            font-weight: bold;
            margin: 5px 0;
          }

          .radio-author {
            font-size: 14px;
            margin-bottom: 5px;

            a:hover {
              text-decoration: underline;
            }
          }

          .radio-desc {
            font-size: 12px;
            color: #fff6;
            height: 35px;
            overflow: hidden;
          }
        }
      }

      .radio-songs-list {
        padding: 5px 10px;

        .radio-song-item {
          padding: 8px 10px;
          border-bottom: 1px solid #fff3;

          .song-cover {
            width: 60px;
            height: 60px;
            border-radius: 5px;
          }

          .song-info {
            display: inline-block;
            width: calc(100% - 140px);
            vertical-align: top;
            padding-left: 20px;

            .song-name {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
  }
</style>