<template>
  <div>
    <div class="page-left-container">
      <div class="pt_20 pl_20">
        <i class="el-icon-more" @mouseover="showMore = true" style="color: #fff">
          <div class="down-count" v-if="!showMore && downList.count > 0">{{downList.count > 99 ? '99+' : downList.count}}</div>
          <div :class="`show-container ${showMore ? 'show' : ''}`" @mouseleave="showMore = false">
            <div class="show-more">
              <a href="#/import" style="border: none">导入外部链接</a>
              <a href="#/download">下载中心 <span v-if="downList.count > 0">({{downList.count > 99 ? '99+' : downList.count}})</span></a>
              <a href="#/version">更新记录</a>
            </div>
          </div>
        </i>
      </div>
      <Cd v-if="!showComment" />
      <SongInfo v-if="!showComment" />
      <Comment v-if="showComment" />
    </div>
    <div class="song-container">
      <TagList />
      <div class="inline-block">
        <Search />
        <el-carousel :autoplay="false" arrow="never" ref="carousel" @change="changeCarousel">
          <el-carousel-item name="list">
            <SongList v-if="searchKey !== '电台'" :isSys="tagOwner === '系统'" :tag="tag" />
            <RadioList v-if="searchKey === '电台'" />
          </el-carousel-item>
          <el-carousel-item name="lyric">
            <Lyric />
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
  </div>
</template>

<script>
  import Cd from '@/components/playShow/Cd';
  import SongList from '@/components/SongList';
  import SongInfo from '@/components/SongInfo';
  import Search from '@/components/Search';
  import TagList from '@/components/TagList';
  import Lyric from '@/components/Lyric';
  import RadioList from '@/components/RadioList';
  import Comment from '@/components/Comment';
  import { mapGetters } from 'vuex';

  export default {
    name: "playerpage",
    components: { Cd, SongList, SongInfo, Search, TagList, Lyric, RadioList, Comment },
    data() {
      return {
        tag: '',
        tags: [],
        tagOwner: '系统',
        showMore: false,
      }
    },
    mounted() {
      this.getTags();
    },
    computed: {
      ...mapGetters({
        listContent: 'getListContent',
        showList: 'getShowList',
        downList: 'getDownList',
        searchKey: 'getSearchKey',
        showComment: 'getShowComment',
      })
    },
    watch: {
      showList() {
        this.$refs.carousel.setActiveItem(0);
      },
      listContent(v) {
        this.$refs.carousel.setActiveItem(v);
      }
    },
    methods: {
      changeCarousel(v) {
        this.$store.dispatch('setListContent', v);
      },
      getTags() {
        if (!this.$store.state.sysTags.length) {
          setTimeout(this.getTags, 100);
        }
        this.tags = this.$store.state.sysTags;
      },
      selectTag(tag) {
        this.tag = tag;
      },
      changeOwner() {
        if (this.tagOwner === '系统') {
          this.tags = this.$store.state.sysTags;
        } else {
          this.tags = [];
        }
        this.tag = '';
      },
    }
  }
</script>

<style lang="scss">
  .page-left-container {
    width: calc(100vw - 635px);
    height: calc(100vh - 110px);
    display: inline-block;
    overflow-y: auto;

    &::-webkit-scrollbar
    {
      width:0;
    }
  }
  .el-icon-more {
    background: rgba(255,255,255,0.2);
    padding: 2px 8px;
    border-radius: 4px;
    cursor: pointer;
    position: relative;

    .down-count {
      position: absolute;
      right: -6px;
      top: -6px;
      background: #F23C3C;
      padding: 3px 6px;
      font-weight: bold;
      font-size: 10px;
      border-radius: 4px;
      color: #fff;

    }
  }
  .show-container {
    position: absolute;
    left: 0;
    top: 0;
    transition: 0.3s;
    z-index: 2;
    opacity: 0;
    height: 0;
    padding-top: 0;
    overflow: hidden;

    &::-webkit-scrollbar
    {
      width:0;
    }

    &.show {
      opacity: 1;
      height: 95px;
      padding-top: 30px;
    }

    .show-more {
      background: rgba(255,255,255,0.4);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.6);
      width: 120px;
      font-size: 14px;
      border-radius: 5px;

      a {
        color: #fff;
        display: block;
        height: 30px;
        line-height: 30px;
        text-align: center;
        border-top: 1px solid #fff;
        background: rgba(255,255,255,0);
        transition: 0.3s;

        &:hover {
          background: rgba(255,255,255,0.3);
        }
      }
    }
  }

  .el-carousel__container {
    height: calc(100vh - 170px) !important;
  }
  .el-carousel__indicators .el-carousel__indicator .el-carousel__button {
    height: 5px;
    border-radius: 5px;
  }
  .song-container {
    display: inline-block;
    vertical-align: top;
    position: absolute;
    right: 20px;
    top: 20px;
  }
</style>