<template>
  <div class="radio-list-container">
    <div :class="`radio-box ${r.id === radioInfo.selected.radioId && 'selected'}`" v-for="r in radioInfo.tag[radioInfo.selected.tagId].list" :key="`tag-${r.id}`">
      <div class="radio-img" @click="playRadio(r.id)">
        <img :src="r.pic_url" alt="">
      </div>
      <div>{{r.title}}</div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import request from '../assets/utils/request';
  export default {
    name: "RadioList",
    computed: {
      ...mapGetters({
        radioInfo: 'getRadioInfo',
        allSongs: 'getAllSongs',
      })
    },
    methods: {
      playRadio(id) {
        request.getQQRadio(id, this);
      }
    }
  }
</script>

<style lang="scss">
  .radio-list-container {
    color: #fff;
    height: calc(100vh - 200px);
    overflow-y: auto;
    overflow-x: hidden;
    width: 551px;
    margin-top: 10px;
    margin-right: 20px;

    .radio-box {
      width: 23.3%;
      padding: 5%;
      display: inline-block;
      text-align: center;
      opacity: 0.2;
      transition: 0.5s;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }

      &.selected {
        opacity: 1;
      }

      .radio-img img {
        width: 120px;
        height: 120px;
      }
    }
  }
</style>