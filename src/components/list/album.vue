<template>
  <div :class="`list-albums ${className || ''}`">
    <div
      v-for="a in albums"
      :key="a.id"
      class="album-item"
    >
      <div class="album-img-container pointer" @click="goTo(a)">
        <img :src="`${a.picUrl}?param=200y200`" />
      </div>
      <div class="album-name pointer" @click="goTo(a)">{{a.name}}</div>
    </div>
    <div v-if="(albums || []).length === 0" class="text-center mt_40">{{emptyText || '没啥专辑哟'}}</div>
  </div>
</template>

<script>
  import { changeUrlQuery } from "../../assets/utils/stringHelper";

  export default {
    name: "album",
    props: {
      albums: Array,
      className: String,
      emptyText: String,
    },
    methods: {
      goTo({ id, mid, platform }) {
        changeUrlQuery({
          id, mid, from: platform
        }, '#/album')
      },
    }
  }
</script>

<style lang="scss">
  .list-albums {
    color: #fff9;

    .album-item {
      display: inline-block;
      width: 50%;
      box-sizing: border-box;
      text-align: center;
      margin: 20px 0;
      transition: 0.3s;
      opacity: 0.7;
      box-shadow: 0 0 0 transparent;

      &:hover {
        opacity: 0.9;

        .album-img-container {
          border-radius: 20px;
          box-shadow: 0 0 30px #333333;

          img {
            width: 170px;
            height: 170px;
            top: -10px;
            left: -10px;
          }
        }
      }

      .album-img-container {
        display: inline-block;
        width: 150px;
        height: 150px;
        position: relative;
        overflow: hidden;
        border-radius: 30px;
        transition: 0.4s;

        img {
          width: 150px;
          height: 150px;
          left: 0;
          top: 0;
          position: absolute;
          transition: 0.3s linear;
        }
      }
      .album-name {
        margin-top: 5px;
        padding: 0 20px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        box-sizing: border-box;
      }
    }
  }
</style>