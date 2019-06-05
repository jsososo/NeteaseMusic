<template>
  <div :class="`tag-list-container ${showList ? 'show-list' : 'hide-list'}`" @mouseover="showList = true" @mouseout="showList = false">
    <i class="iconfont icon-arrow-left show-tag-btn" @mouseover="showList = true" />
    <div class="tag-list" v-if="searchKey !== '电台'">
      <div
        :class="`tag-item
        ${tagInfo.isSys && tagInfo.selected && tagInfo.selected.dissid === item.dissid && 'selected'}
        ${tagInfo.playing === item && 'playing'}`"
        v-for="(item, index) in userList.list" :key="`tag-${item}-${index}`"
        @click="selectTag(item.id)"
      >{{item.name}}</div>
    </div>
    <div class="tag-list" v-if="searchKey === '电台'">
      <div
        :class="`tag-item
        ${radioInfo.selected.tagId === item.id && 'selected'}
        ${radioInfo.playing.tagId === item.id && 'playing'}`"
        v-for="(item) in radioInfo.tag" :key="`tag-${item.title}-${item.id}`"
        @click="selectRadioTag(item.id)"
      >{{item.title}}</div>
    </div>
  </div>
</template>

<script>
  import request from '../assets/utils/request';
  import { mapGetters } from 'vuex';
  import Storage from "../assets/utils/Storage";

  export default {
    name: "TagList",
    data() {
      return {
        showList: false,
        tagType: 'sys',
      }
    },
    computed: {
      ...mapGetters({
        tagInfo: 'getTagInfo',
        allSongs: 'getAllSongs',
        userList: 'getUserList',
        searchKey: 'getSearchKey',
        radioInfo: 'getRadioInfo',
      }),
    },
    methods: {
      // 选中标签，去请求列表內的歌曲
      selectTag(id) {
        const { dispatch } = this.$store;
        dispatch('updateSelectedTag', id);
        dispatch('setListContent', 0);
        dispatch('changeSearchKey', '列表内');
        request.getQQMyFavList(id, Storage.get('uQ'), { upShow: true });
      },
      selectRadioTag(id) {
        const { dispatch } = this.$store;
        const { radioInfo } = this;
        radioInfo.selected.tagId = id;
        dispatch('updateRadioInfo', radioInfo);
      }
    },
  }
</script>

<style lang="scss">
  .tag-list-container {
    display: inline-block;
    vertical-align: top;
    height: calc(100vh - 200px);
    margin-top: 60px;
    position: relative;
    transition: 0.3s linear;

    .tag-list {
      overflow: hidden;
      transition: 0.3s linear;
      color: rgba(255,255,255,0.7);
      height: calc(100vh - 200px);
      overflow-y: auto;
      position: absolute;
      min-height: 500px;

      .tag-item {
        width: 100%;
        text-overflow: ellipsis;
        white-space:nowrap;
        overflow: hidden;
        height: 20px;
        padding: 10px 5px 10px 10px;
        transition: 0.4s;

        &.selected {
          background: rgba(255,255,255,0.2) !important;
        }

        &:hover {
          background: rgba(255,255,255,0.1);
        }
        &.playing {
          background: rgba(255,255,255,0.2);
          border-left: 3px solid rgba(255,255,255,0.6);
        }
      }

      &::-webkit-scrollbar {
        width: 0px;
        height: 8px;
        background-color: rgba(0, 0, 0, 0);
      }
    }

    &.hide-list {
      width: 50px;

      .show-tag-btn {
        display: inline-block;
      }

      .tag-list {
        width: 0;
        opacity: 0;
        z-index: -1;
        left: 50px;
      }
    }

    &.show-list {
      width: 130px;

      .show-tag-btn {
        display: none;
      }

      .tag-list {
        width: 130px;
        opacity: 1;
        z-index: 10;
        left: 0;
      }
    }

    .show-tag-btn {
      position: absolute;
      top: calc(50vh - 125px);
      font-size: 50px;
      color: rgba(255,255,255,0.4);
    }
  }
</style>