<template>
  <div :class="`playlist-container ${show && 'show'}`">
    <div class="playlist-list">
      <div v-if="!user.userId && hash === 'playlist'" class="text-center fc_fff ft_20" style="padding-top: 100px;opacity: 0.8;letter-spacing: 2px;">
        登陆后可以查看个人歌单
      </div>

      <!-- 日推-->
      <div
        v-if="allList.daily && (hash === 'playlist' || hash === 'recommend')"
        :class="`playlist-item ${playingListId === 'daily' && 'playing'}`"
        @click="goTo('daily')"
      >
        <div class="list-img" style="border: 1px solid #fff5;text-align: center;">
          {{new Date().getDate()}}
        </div>
        <span class="list-name">每日推荐</span>
        <span class="list-count">{{allList.daily.length}}</span>
        <div v-if="playingListId == 'daily' && isPlaying" class="playing-item-bg">
          <div v-for="(o, i) in new Array(100)" :key="`bg-item-${i}`" :class="`playing-bg-${i}`">
            <div class="bg-item-inside"></div>
          </div>
        </div>
      </div>
      <!-- 歌单列表 -->
      <div
        v-if="hash === 'playlist' || hash === 'recommend'"
        :class="`playlist-item ${playingListId == item.id && 'playing'}`"
        v-for="item in (hash === 'playlist' ? userList.list : recommendList.list)"
        :key="`playlist-${item.id}`"
        @click="goTo(item.id)"
      >
        <div v-if="playingListId == item.id && isPlaying" class="playing-item-bg">
          <div v-for="(o, i) in new Array(100)" :key="`bg-item-${i}`" :class="`playing-bg-${i}`">
            <div class="bg-item-inside"></div>
          </div>
        </div>
        <img :src="`${item.coverImgUrl}?param=50y50`" class="list-bg-img" />
        <img :src="`${item.coverImgUrl}?param=200y200`" class="list-img" />
        <span class="list-name">{{item.name}}</span>
        <span class="list-count">{{item.trackCount}}</span>
        <i @click="toHeartMode(item.id)" :class="`iconfont icon-heart heart-btn ${heartMode && playingListId === item.id && 'hearting'}`" />
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import request, { handleSongs } from '../assets/utils/request';
  export default {
    name: "PlayList",
    data() {
      return {
        show: false,
        hash: '',
      };
    },
    computed: {
      ...mapGetters({
        userList: 'getUserList',
        allList: 'getAllList',
        recommendList: 'getRecommendList',
        user: 'getUser',
        playingListId: 'getPlayingListId',
        heartMode: 'isHearMode',
        allSongs: 'getAllSongs',
        isPlaying: 'isPlaying',
      })
    },
    created() {
      this.hashChange();
      setTimeout(() => {
        this.show = true;
        window.onhashchange = this.hashChange;
      });
    },
    destroyed() {
      this.show = false;
      window.onhashchange = null;
    },
    methods: {
      hashChange() {
        const hashs = ['playlist', 'recommend'];
        this.hash = hashs.find((h) => document.location.hash.indexOf(h) > -1);
      },
      goTo(id) {
        window.location = `#/playlist/detail?id=${id}`;
      },
      toHeartMode(pid) {
        window.event.stopPropagation();
        const { userList, allList, allSongs } = this;
        const favList = allList[userList.favId].length > 0 ? allList[userList.favId] : allList.daily;
        const randomId = favList[Math.floor(Math.random(favList.length))];
        request({
          api: 'GET_HEART_MODE',
          data: {
            pid,
            id: randomId,
          }
        }).then(async (res) => {
          const ids = [];
          const { dispatch } = this.$store;
          const songs = res.data.map((item) => {
            ids.push(item.id);
            return item.songInfo;
          });
          await handleSongs(songs);
          dispatch('updatePlayNow', allSongs[ids[0]]);
          dispatch('updatePlayingList', { list: ids, id: pid, heart: true });
          dispatch('updatePlayingStatus', true);
          this.$message.success('心动模式启动～');
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .playlist-container {
    width: 40%;
    display: inline-block;
    vertical-align: top;
    height: (calc(100% - 40px));
    overflow: auto;
    position: absolute;
    left: 80%;
    opacity: 0;
    transition: 0.5s;

    &.show {
      left: 60%;
      opacity: 1;
    }

    &::-webkit-scrollbar {
      width: 0;
      height:8px;
      background-color:rgba(0,0,0,0);
    }

    .playlist-list {
      background: #0003;
      border-left: 1px solid #fffc;
      padding-left: 20px;
      height: 100%;

      .playlist-item {
        position: relative;
        height: 80px;
        overflow: hidden;
        padding: 10px;
        opacity: 0.8;
        transition: 0.4s;
        box-shadow: 0 0 0 #0003;

        .playing-item-bg {
          @for $i from 0 through 100 {
            $r4: random(2);

            .playing-bg-#{$i} {
              width: 1%;
              position: absolute;
              bottom: 0;
              left: percentage($i / 100);
              border-top: 3px solid #409EFF;
              overflow: hidden;
              opacity: 0.3;
              animation: p-b-#{$i} #{$r4 / 3}s infinite linear;
              border-radius: 5px 5px 0 0;

              .bg-item-inside {
                height: 60px;
                width: 100%;
                background: linear-gradient(bottom, #409EFF, #409eff00);
                position: absolute;
                bottom: 0;
              }
            }

            @keyframes p-b-#{$i} {
              from, to {
                height: #{random(60)}px;
              }
              20% {
                height: #{random(60)}px;
              }
              40% {
                height: #{random(60)}px;
              }
              60% {
                height: #{random(60)}px;
              }
              80% {
                height: #{random(60)}px;
              }
            }
          }
        }

        .list-bg-img {
          position: absolute;
          z-index: 0;
          opacity: 0.2;
          filter: blur(30px);
          width: 200px;
          height: 200px;
          top: -60px;
          transition: 0.3s;
        }
        .heart-btn {
          position: absolute;
          bottom: 20px;
          left: 105px;
          color: #fff3;
          font-weight: bold;
          cursor: pointer;
          font-size: 20px;
          transition: 0.3s;

          &.hearting {
            color: #F56C6C88;
            animation: hearting 1.4s infinite;
            
            @keyframes hearting {
              from, to, 40%, 50%, 60%, 70% {
                font-size: 20px;
              }
              45%, 65% {
                font-size: 26px;
              }
            }
          }
        }
        .list-img {
          border-radius: 3px;
          display: inline-block;
          transition: 0.3s;
          position: absolute;
          transform: rotate(0);
          top: 10px;
          left: 10px;
          width: 70px;
          height: 70px;
          line-height: 70px;
          font-weight: bold;
          color: #fff5;
          font-size: 40px;
        }
        .list-name {
          display: inline-block;
          vertical-align: top;
          font-size: 20px;
          color: #fffc;
          margin-left: 20px;
          transition: 0.3s;
          padding-left: 70px;
          white-space: nowrap;
        }
        .list-count {
          position: absolute;
          right: 10px;
          font-weight: bold;
          font-size: 44px;
          color: #fff4;
          padding-top: 30px;
          transform: rotate(0);
          transition: 0.3s;
        }

        &.playing {
          .list-count {
            color: #409EFF88;
          }
        }

        &:hover {
          opacity: 1;
          box-shadow: 0 4px 20px #0004;
          
          .heart-btn {
            left: 120px;
            color: #fffc;

            &.hearting {
              color: #F56C6C;
            }
          }

          .list-count {
            transform: rotate(-90deg);
            padding-top: 10px;
          }

          .list-name {
            font-size: 24px;
            padding-left: 85px;
          }
          .list-img {
            transform: rotate(-30deg);
            top: -20px;
            left: -40px;
            width: 120px;
            height: 120px;
            line-height: 120px;
            font-size: 70px;
          }
        }
      }
    }
  }
</style>