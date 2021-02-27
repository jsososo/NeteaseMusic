<template>
  <div class="top-page">
    <div class="top-cats-container">
      <div :class="`top-platform platform-${topInfo.platform}`">
        <span class="from-text">FROM</span>
        <span class="from-text from-text-2">FROM</span>
        <span class="platform-icon iconfont icon-163" @click="updatePlatform('163')" />
        <span class="platform-icon iconfont icon-qq" @click="updatePlatform('qq')" />
      </div>
      <div class="category-type-list-container hide-scroll">
        <div class="category-type-list" v-for="type in category">
          <div class="category-type-name">{{type.title}}</div>
          <div v-if="c.id !== 201" :class="`cate-box ${topInfo[`${topInfo.platform}id`] === c.id && 'actived'}`" v-for="c in type.list" @click="selectType(c.id)">
            <div class="cate-cover" :style="`background-image: url('${c.cover}')`">
              <div class="play-count"><i class="iconfont icon-earphone pr_10" />{{numToStr(c.playCount)}}</div>
            </div>
            <div class="cate-name">{{c.name}}</div>
          </div>
        </div>
      </div>
    </div>

    <PlayListDetail
      :trueList="topInfo[`${topInfo.platform}List`]"
      :loading="loading"
      :list-info="topInfo[`${topInfo.platform}Info`]"
    />
  </div>
</template>

<script>
  import request, { handleSongs } from '../assets/utils/request';
  import {mapGetters} from "vuex";
  import {numToStr} from "../assets/utils/stringHelper";
  import PlayListDetail from "../components/PlayListDetail";

  export default {
    name: "Top",
    components: { PlayListDetail },
    data() {
      return {
        category: [],
        loading: false,
      }
    },
    computed: {
      ...mapGetters({
        topInfo: 'getTopInfo',
      })
    },
    created() {
      this.$store.dispatch('updateShowCover', false);
      this.getCategory();
    },
    methods: {
      updatePlatform(platform) {
        this.updateTop({ platform });
        this.getCategory();
      },
      async getCategory() {
        const { platform } = this.topInfo;
        const { data = [] } = await request('TOP_CATEGORY', platform);
        this.category = data;
      },
      async selectType(id) {
        const { platform } = this.topInfo;
        this.updateTop({ [`${platform}id`]: id, [`${platform}Info`]: {}, [`${platform}List`]: [] });
        this.loading = true;
        const res = await request({
          api: 'TOP_SONGS',
          data: {
            id,
            _p: platform,
          }
        })
        this.loading = false;
        res.data.desc = res.data.desc.replace(/<br>/g, '')
        this.updateTop({ [`${platform}Info`]: res.data });
        this.updateTop({ [`${platform}List`]: await handleSongs(res.data.list) });
      },
      updateTop(data) {
        this.$store.dispatch('updateTopInfo', data);
      },
      numToStr,

    }
  }
</script>

<style scoped lang="scss">
  .top-page {
    .top-cats-container {
      position: absolute;
      height: calc(100vh - 120px);
      top: 20px;
      left: 100px;
      width: 53%;

      .category-type-list-container {
        height: calc(100vh - 180px);
        overflow: auto;
      }

      .top-platform {
        font-size: 60px;
        font-weight: bold;
        line-height: 80px;

        .from-text-2 {
          position: absolute;
          top: 5px;
          left: 5px;
          opacity: 0.5;
        }

        &.platform-163 {
          .from-text-2, .icon-163 {
            color: #F23C3C66;
          }
        }
        &.platform-qq {
          .from-text-2, .icon-qq {
            color: #67C23A66;
          }
        }

        .from-text {
          padding-right: 50px;
          transition: 0.3s;
          color: #fff6;
        }

        .platform-icon {
          font-size: 24px;
          vertical-align: top;
          cursor: pointer;
          display: inline-block;
          margin: 0 20px;
          color: #fff6;
          transition: 0.3s;
        }
      }

      .category-type-list {
        position: relative;
        padding-top: 40px;

        .category-type-name {
          position: absolute;
          top: 0;
          left: 0;
          font-size: 50px;
          font-weight: bold;
          color: #fff6;
          letter-spacing: 0.2em;
        }

        .cate-box {
          display: inline-block;
          vertical-align: top;
          width: 160px;
          opacity: 0.6;
          margin-right: 24px;
          text-align: center;
          cursor: pointer;
          margin-bottom: 24px;
          transition: 0.3s;

          &.actived {
            opacity: 1;

            .cate-cover {
              animation: activeCateBox 2s infinite;

              @keyframes activeCateBox {
                from, to, 25% {
                  transform: rotate(0);
                }
                2.5%, 22.5% {
                  transform: rotate(1deg);
                }
                20% {
                  transform: rotate(-1deg);
                }
                5%, 10%, 15% {
                  transform: rotate(-2deg);
                }
                7.5%, 12.5%, 17.5% {
                  transform: rotate(2deg);
                }
              }
            }
          }

          &:hover {
            .cate-cover {
              background-size: 135%;
              animation-play-state: paused;
            }
          }

          .cate-cover {
            width: 160px;
            height: 160px;
            background-size: 100%;
            background-position: center;
            border-radius: 5px;
            position: relative;
            transition: 0.3s;

            .play-count {
              color: #fff;
              position: absolute;
              bottom: 5px;
              right: 10px;
            }
          }

          .cate-name {
            color: #fffc;
            font-size: 16px;
            height: 40px;
            width: 95%;
            margin-left: 2.5%;
            margin-top: 15px;
          }
        }
      }
    }
  }
</style>