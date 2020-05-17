<template>
  <div :class="`list-singers ${className || ''}`" >
    <div v-for="s in singers" class="singer-item" @click="goTo(s)">
      <img class="singer-img" :src="`${s.picUrl}?param=120y120`"  />
      <div class="singer-name">{{s.name}}</div>
    </div>
    <div v-if="(singers || []).length === 0" class="text-center mt_40">{{emptyText || '没啥歌手哟'}}</div>
  </div>
</template>

<script>
  import { changeUrlQuery } from "../../assets/utils/stringHelper";

  export default {
    name: "singer",
    props: {
      singers: Array,
      emptyText: String,
      className: String,
    },
    methods: {
      goTo({ id, mid, platform: from }) {
        changeUrlQuery({ id, mid, from }, '#/singer');
      }
    }
  }
</script>

<style lang="scss">
  .list-singers {
    color: #fff9;

    .singer-item {
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

      .singer-img {
        width: 60%;
        border-radius: 50%;
        margin-top: 20px;
      }

      .singer-name {
        padding-top: 10px;
        color: #fff8;
      }
    }
  }
</style>