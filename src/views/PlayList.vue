<template>
  <div :class="`playlist-container ${show && 'show'}`">

    <div class="right-select-tab-list">
      <div
        :class="`tab-item-${i} c-${t.color} ${selected === t.key && 'selected'}`"
        v-for="(t, i) in tabs"
        v-if="t.hide !== hash"
        :key="t.icon"
        @click="selected = t.key"
      >
        <i :class="`iconfont icon-${t.icon}`" />
        {{t.val}}
      </div>
    </div>

    <div v-if="selected === '163'" class="playlist-list hide-scroll">
      <div v-if="!user.userId && hash === 'playlist' && !$route.query.id" class="text-center fc_fff ft_20" style="padding-top: 100px;opacity: 0.8;letter-spacing: 2px;">
        登陆后可以查看个人歌单
      </div>

      <!-- 日推-->
      <div
        v-if="allList.daily && !$route.query.id"
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

      <!-- 私人 FM -->
      <div
        v-if="allList.daily && !$route.query.id"
        :class="`playlist-item ${playingListId === 'daily' && 'playing'}`"
        @click="playPersonFM"
      >
        <div class="list-img" style="border: 1px solid #fff5;text-align: center;">
          FM
        </div>
        <span class="list-name">私人FM</span>
        <!--<span class="list-count">{{allList.daily.length}}</span>-->
        <div v-if="isPersonFM && isPlaying" class="playing-item-bg">
          <div v-for="(o, i) in new Array(100)" :key="`bg-item-${i}`" :class="`playing-bg-${i}`">
            <div class="bg-item-inside"></div>
          </div>
        </div>
      </div>
      <!-- 歌单列表 -->
      <div
        :class="`playlist-item ${playingListId == item.id && 'playing'}`"
        v-for="item in pagePlayList"
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
        <span class="list-creator" v-if="item.creator">
          By: <a :href="`#/user?id=${item.creator.userId}`">{{item.creator.nickname}}</a>
          <span class="pl_20" v-if="item.playCount"><i class="iconfont icon-yinyue" />: {{numToStr(item.playCount)}}</span>
        </span>
      </div>
    </div>

    <div v-if="selected === 'qq'" class="playlist-list hide-scroll">
      <div class="input-qq mb_20" v-if="hash === 'playlist'">
        <input type="text" placeholder="输入QQ号吧" v-model="inputQQ" />
        <div class="update-btn" v-if="inputQQ !== qqId" @click="updateQQNum">更新</div>
      </div>
      <div v-if="!qqId && hash === 'playlist'" class="text-center fc_fff ft_20" style="padding-top: 100px;opacity: 0.8;letter-spacing: 2px;">
        输入 QQ 号可查看个人歌单
      </div>
      <div v-if="qqId && qUserList.list.length === 0 && hash === 'playlist'" class="text-center fc_fff ft_20" style="padding-top: 100px;opacity: 0.8;letter-spacing: 2px;">
        没有歌单呢
      </div>

      <!-- 歌单列表 -->
      <div
        :class="`playlist-item ${playingListId == `qq${item.id}` && 'playing'}`"
        v-for="item in pagePlayList"
        :key="`playlist-q-${item.id}`"
        @click="goTo(item.id, 'qq')"
      >
        <div v-if="playingListId == `qq${item.id}` && isPlaying" class="playing-item-bg">
          <div v-for="(o, i) in new Array(100)" :key="`bg-item-${i}`" :class="`playing-bg-${i}`">
            <div class="bg-item-inside"></div>
          </div>
        </div>
        <img :src="`${item.coverImgUrl}?param=50y50`" class="list-bg-img" />
        <img :src="`${item.coverImgUrl}?param=200y200`" class="list-img" />
        <span class="list-name">{{item.name}}</span>
        <span class="list-creator">
          <span v-if="item.playCount"><i class="iconfont icon-yinyue" />: {{numToStr(item.playCount)}}</span>
        </span>
        <span class="list-count">{{item.trackCount}}</span>

      </div>
    </div>

    <div v-if="selected === 'migu'" class="playlist-list hide-scroll">
      <!-- 歌单列表 -->
      <div
        :class="`playlist-item ${playingListId == `migu${item.id}` && 'playing'}`"
        v-for="item in pagePlayList"
        :key="`playlist-m-${item.id}`"
        @click="goTo(item.id, 'migu')"
      >
        <div v-if="playingListId == `migu${item.id}` && isPlaying" class="playing-item-bg">
          <div v-for="(o, i) in new Array(100)" :key="`bg-item-${i}`" :class="`playing-bg-${i}`">
            <div class="bg-item-inside"></div>
          </div>
        </div>
        <img :src="`${item.picUrl}`" class="list-bg-img" />
        <img :src="`${item.picUrl}`" class="list-img" />
        <span class="list-name">{{item.name}}</span>
        <span class="list-creator">
          By: <span>{{item.creator.name}}</span>
          <span class="pl_20" v-if="item.playCount"><i class="iconfont icon-yinyue" />: {{numToStr(item.playCount)}}</span>
        </span>
        <span class="list-count">{{item.songCount}}</span>

      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { numToStr } from "../assets/utils/stringHelper";
  import request, { handleSongs, getPersonFM, queryQQUserDetail } from '../assets/utils/request';
  import Storage from "../assets/utils/Storage";
  export default {
    name: "PlayList",
    data() {
      return {
        show: false,
        hash: '',
        pagePlayList: [],
        tabs: [
          {
            icon: '163',
            key: '163',
            color: 'red',
            val: '网易云'
          },
          {
            icon: 'qq',
            key: 'qq',
            color: 'green',
            val: '企鹅'
          },
          {
            icon: 'migu',
            key: 'migu',
            color: 'yellow',
            hide: 'playlist',
            val: '咪咕',
          },
        ],
        selected: '163',
        inputQQ: Storage.get('qqId'),
        qqId: Storage.get('qqId'),
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
        isPersonFM: 'isPersonFM',
        qUserList: 'getQUserList',
      })
    },
    watch: {
      $route() {
        this.hashChange();
      },
      userList(v) {
        if (this.hash === 'playlist') {
          this.pagePlayList = v.list;
        }
      },
      selected(v) {
        Storage.set('playlist_from', v);
        this.hashChange();
      },
      recommendList() {
        this.hashChange();
      }
    },
    created() {
      this.hashChange();
      setTimeout(() => this.show = true);
      this.selected = Storage.get('playlist_from') || '163';
      if (this.inputQQ) {
        this.updateQQNum();
      }
    },
    destroyed() {
      this.show = false;
    },
    methods: {
      hashChange() {
        const hashs = ['playlist', 'recommend'];
        this.hash = hashs.find((h) => document.location.hash.indexOf(h) > -1);
        const { selected, hash } = this;
        this.pagePlayList = [];
        switch (`${hash}-${selected}`) {
          case 'recommend-qq':
            return !this.recommendList.qqList ? this.getQQRecommend() : (this.pagePlayList = this.recommendList.qqList);
          case 'recommend-migu':
            return !this.recommendList.miguList ? this.getMiguRecommend() : (this.pagePlayList = this.recommendList.miguList);
          case 'recommend-163':
            return this.pagePlayList = this.recommendList.list;
          case 'playlist-qq':
            return this.pagePlayList = this.qUserList && this.qUserList.list || [];
          case 'playlist-163':
            return (this.$route.query.id ? this.queryPlayList() : (this.pagePlayList = this.userList.list));
          case 'playlist-migu':
            return this.selected = '163';
        }
      },
      getQQRecommend() {
        request('QQ_RECOMMEND_PLAYLIST')
          .then(res => {
            const { recommendList } = this;
            recommendList.qqList = res.data.list.map(({ cover_url_medium, song_ids, access_num, creator_info, title, tid }) => ({
              from: 'qq',
              id: tid,
              name: title,
              creator: creator_info,
              playCount: access_num,
              trackCount: song_ids.length,
              coverImgUrl: cover_url_medium,
            }));
            this.hashChange();
          })
      },
      getMiguRecommend() {
        request('MIGU_RECOMMEND_PLAYLIST')
          .then(res => {
            const { recommendList } = this;
            recommendList.miguList = res.data.list;
            this.hashChange();
          })
      },
      queryPlayList() {
        const { id } = this.$route.query;
        request({
          api: 'USER_LIST',
          data: {
            uid: id
          },
        }).then((res) => {
          this.pagePlayList = res.playlist;
        })
      },
      goTo(id, platform = '') {
        window.location = `#/playlist/detail?id=${id}&from=${platform}`;
      },
      toHeartMode(pid) {
        window.event.stopPropagation();
        const { userList, allList, allSongs, user } = this;
        if (!user.userId) {
          return this.$message.warning('登陆后才可以开启心动模式');
        }
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
      },
      playPersonFM() {
        const { dispatch } = this.$store;
        const { isPersonFM, allSongs } = this;
        const updatePlayNow = (id) => {
          if (this.allSongs[id]) {
            dispatch('updatePlayNow', allSongs[id]);
          } else {
            setTimeout(() => updatePlayNow(id), 100);
          }
        };
        if (!isPersonFM) {
          getPersonFM()
            .then((songs) => {
              const ids = songs.map((s) => s.id);
              dispatch('setPersonFM', ids);
              updatePlayNow(ids[0]);
            })
        }
      },
      updateQQNum() {
        const { inputQQ } = this;
        this.qqId = inputQQ;
        Storage.set('qqId', inputQQ);
        queryQQUserDetail(inputQQ);
      },

      numToStr,
    }
  }
</script>

<style lang="scss" scoped>
  .playlist-container {
    width: 40%;
    display: inline-block;
    vertical-align: top;
    height: (calc(100vh - 100px));
    position: absolute;
    left: 60%;
    transform: translate(100%);
    opacity: 0;
    transition: 0.5s;

    &.show {
      transform: translate(0);
      opacity: 1;
    }

    .playlist-list {
      background: #0003;
      border-left: 1px solid #fffc;
      padding-left: 20px;
      height: 100%;
      overflow-y: auto;

      .input-qq {
        margin-top: 20px;

        input {
          display: inline-block;
          vertical-align: top;
          background: transparent;
          outline: none;
          border: none;
          color: #fffa;
          width: 300px;
          font-size: 22px;
          border-bottom: 1px solid #fff3;
          
          &::placeholder {
            color: #fff3;
          }
        }

        .update-btn {
          display: inline-block;
          vertical-align: top;
          border: 1px solid #fff8;
          padding: 2px 12px;
          border-radius: 4px;
          cursor: pointer;
          color: #fff8;
          margin-left: 20px;
          transition: 0.3s;
          
          &:hover {
            color: #fffa;
            border-color: #fffa;
          }
        }
        
      }

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
              width: 0.8%;
              position: absolute;
              bottom: 0;
              left: percentage($i / 100);
              border-top: 3px solid #409EFF;
              overflow: hidden;
              opacity: 0.3;
              height: 45px;
              transform-origin: bottom;
              animation: p-b-#{$i} #{$r4 / 3}s infinite linear;
              border-radius: 5px 5px 0 0;

              .bg-item-inside {
                height: 60px;
                width: 100%;
                background: linear-gradient(to top, #409EFF, #67C23A88, #E6A23C33, #E6A23C00);
                position: absolute;
                bottom: 0;
              }
            }

            @keyframes p-b-#{$i} {
              from, to {
                transform: scaleY(#{random()});
              }
              20% {
                transform: scaleY(#{random()});
              }
              40% {
                transform: scaleY(#{random()});
              }
              60% {
                transform: scaleY(#{random()});
              }
              80% {
                transform: scaleY(#{random()});
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
          left: 110px;
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
                transform: scale(1);
              }
              45%, 65% {
                transform: scale(1.2);
              }
            }
          }
        }
        .list-creator {
          position: absolute;
          left: 145px;
          bottom: 20px;
          font-weight: bold;
          font-size: 14px;
          color: #fff5;
          transition: 0.3s;

          a {
            color: #fff5;
            text-decoration: underline;
            transition: 0.3s;
          }
        }
        .list-img {
          border-radius: 3px;
          display: inline-block;
          transition: 0.3s;
          position: absolute;
          transform: rotate(0) scale(0.38) translate(-138px, -156px);
          top: 10px;
          left: 10px;
          width: 200px;
          height: 200px;
          font-size: 100px;
          line-height: 200px;
          font-weight: bold;
          color: #fff5;
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
          width: 80px;
          text-align: right;
          color: #fff4;
          transform: rotate(0) translate(0, 20px);
          transform-origin: bottom left;
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
            color: #fffc;

            &.hearting {
              color: #F56C6C;
            }
          }
          
          .list-creator {
            transform: translate(10px);
            color: #fffc;
            
            a {
              color: #fffc;
            }
          }

          .list-count {
            transform: rotate(-90deg) translate(-20px, 150%);
            text-align: center;
          }

          .list-name {
            transform: scale(1.2) translate(15px);
          }
          .list-img {
            transform: rotate(-30deg) scale(0.7) translate(-70px, -150px);
          }
        }
      }
    }
  }
</style>