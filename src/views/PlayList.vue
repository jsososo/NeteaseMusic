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

    <div class="playlist-list hide-scroll">
      <div v-if="!user.userId && hash === 'playlist' && !$route.query.id && selected === '163'" class="text-center fc_fff ft_20" style="padding-top: 100px;opacity: 0.8;letter-spacing: 2px;">
        登录后可以查看个人歌单
      </div>
      <div class="input-qq mb_20" v-if="hash === 'playlist' && selected === 'qq'">
        <input type="text" placeholder="输入QQ号吧" v-model="inputQQ" />
        <div class="update-btn" v-if="inputQQ !== qqId" @click="updateQQNum">更新</div>
      </div>
      <div v-if="!qqId && hash === 'playlist' && selected === 'qq'" class="text-center fc_fff ft_20" style="padding-top: 100px;opacity: 0.8;letter-spacing: 2px;">
        输入 QQ 号可查看个人歌单
      </div>

      <!-- 日推-->
      <div
        v-if="allList[`${selected}_daily`] && !$route.query.id"
        :class="`playlist-item ${playingListId === `${selected}_daily` && 'playing'}`"
        @click="goTo(`${selected}_daily`, selected)"
      >
        <div class="list-img" style="border: 1px solid #fff5;text-align: center;">
          {{new Date().getDate()}}
        </div>
        <span class="list-name">每日推荐</span>
        <span class="list-count">{{allList[`${selected}_daily`].length}}</span>
        <div v-if="playingListId === `${selected}_daily` && isPlaying" class="playing-item-bg">
          <div v-for="(o, i) in new Array(100)" :key="`bg-item-${i}`" :class="`playing-bg-${i}`">
            <div class="bg-item-inside"></div>
          </div>
        </div>
      </div>

      <!-- 私人 FM -->
<!--      <div-->
<!--        v-if="selected === '163' && !$route.query.id"-->
<!--        :class="`playlist-item ${playingListId === 'daily' && 'playing'}`"-->
<!--        @click="playPersonFM"-->
<!--      >-->
<!--        <div class="list-img" style="border: 1px solid #fff5;text-align: center;">-->
<!--          FM-->
<!--        </div>-->
<!--        <span class="list-name">私人FM</span>-->
<!--        &lt;!&ndash;<span class="list-count">{{allList.daily.length}}</span>&ndash;&gt;-->
<!--        <div v-if="isPersonFM && isPlaying" class="playing-item-bg">-->
<!--          <div v-for="(o, i) in new Array(100)" :key="`bg-item-${i}`" :class="`playing-bg-${i}`">-->
<!--            <div class="bg-item-inside"></div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
      <!-- 歌单列表 -->
      <div
        :class="`playlist-item ${playingListId === item.listId && 'playing'}`"
        v-for="item in pagePlayList"
        :key="`playlist-${item.id}`"
        @click="goTo(item.id)"
      >
        <div v-if="playingListId == item.listId && isPlaying" class="playing-item-bg">
          <div v-for="(o, i) in new Array(100)" :key="`bg-item-${i}`" :class="`playing-bg-${i}`">
            <div class="bg-item-inside"></div>
          </div>
        </div>
        <img :src="`${item.cover}?param=50y50`" class="list-bg-img" />
        <img :src="`${item.cover}?param=200y200`" class="list-img" />
        <span class="list-name">{{item.name}}</span>
        <span class="list-count">{{item.trackCount}}</span>
        <div class="bottom-text">
          <el-tooltip
            class="item"
            effect="dark"
            content="心动模式"
            placement="top"
            v-if="selected === '163' && user.userId && userList['163'].favListId === item.listId"
          >
            <i @click="toHeartMode(item.listId)" :class="`iconfont icon-heart heart-btn ${heartMode && 'hearting'}`" />
          </el-tooltip>
          <el-tooltip
            v-if="userList[selected] && !userList[selected].mine[item.listId]"
            class="item"
            effect="dark"
            :content="userList[selected].sub[item.listId] ? '已收藏' : '收藏'"
            placement="top"
          >
            <i @click="collectPlaylist(item)" :class="`collect-btn iconfont icon-${userList[selected].sub[item.listId] ? 'collected' : 'collect'}`" />
          </el-tooltip>
          <span class="list-creator" v-if="item.creator && item.creator.nick">
          By: <a>{{item.creator.nick}}</a>
          <span class="pl_20" v-if="item.playCount"><i class="iconfont icon-yinyue" />: {{numToStr(item.playCount)}}</span>
        </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import {getQueryFromUrl, numToStr} from "../assets/utils/stringHelper";
  import request, {
    handleSongs,
    getPersonFM,
    collectPlaylist,
    getUserList
  } from '../assets/utils/request';
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
          // {
          //   icon: 'migu',
          //   key: 'migu',
          //   color: 'yellow',
          //   hide: 'playlist',
          //   val: '咪咕',
          // },
        ],
        selected: getQueryFromUrl('from') || Storage.get('playlist_from') || '163',
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
      selected(v) {
        Storage.set('playlist_from', v);
        this.hashChange();
      },
      recommendList() {
        this.hashChange();
      },
      userList(v) {
        const { selected } = this;
        if (v[selected] && !getQueryFromUrl('id')) {
          this.pagePlayList = v[selected].list.map((id) => v[selected].obj[id]);
        }
      }
    },
    created() {
      this.hashChange();
      setTimeout(() => this.show = true);
      this.selected = getQueryFromUrl('from') || Storage.get('playlist_from') || '163';
      if (document.location.hash.indexOf('playlist') > -1 && this.selected === 'migu') {
        this.selected = '163';
      }
    },
    destroyed() {
      this.show = false;
    },
    methods: {
      async hashChange() {
        const hashs = ['playlist', 'recommend'];
        this.hash = hashs.find((h) => document.location.hash.indexOf(h) > -1);
        const { selected, hash, user, inputQQ } = this;
        this.pagePlayList = [];
        let res, id = getQueryFromUrl('id') || { 163: user.userId, qq: inputQQ }[selected];
        switch (hash) {
          case 'recommend':
            res = await request({
              api: 'RECOMMEND_PLAYLIST',
              data: { login: Number(Boolean(user.userId)), _p: selected }
            });
            this.pagePlayList = res.data;
            break;
          case 'playlist':
            if (selected === 'migu') {
              return this.selected = '163';
            }
            if (id) {
              const { list } = await getUserList(id, this.selected);
              this.pagePlayList = list;
            }

        }
      },
      goTo(id, platform = this.selected) {
        window.location = `#/playlist/detail?id=${id}&from=${platform}`;
      },
      async toHeartMode(pid) {
        window.event.stopPropagation();
        const { userList, allList, allSongs, user } = this;
        if (!user.userId) {
          return this.$message.warning('登录后才可以开启心动模式');
        }
        const { favListId } = userList['163'];
        const favList = (allList[favListId] || []).length > 0 ? allList[favListId] : allList['163_daily'];
        const randomId = favList[Math.floor(Math.random(favList.length))].replace('163_', '');
        const truePid = pid.split('_')[1];
        const { data } = await request({
          api: 'GET_HEART_MODE',
          data: {
            pid: truePid,
            id: randomId,
            _p: '163',
          }
        })
        const { dispatch } = this.$store;
        const ids = await handleSongs(data);
        dispatch('updatePlayNow', this.allSongs[ids[0]]);
        dispatch('updatePlayingList', { list: ids, listId: pid, heart: true });
        dispatch('updatePlayingStatus', true);
        this.$message.success('心动模式启动～');
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
        this.hashChange();
      },

      numToStr,

      collectPlaylist,
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
        .bottom-text {
          position: absolute;
          bottom: 20px;
          color: #fff3;
          font-weight: bold;
          cursor: pointer;
          font-size: 20px;
          transition: 0.3s;
          left: 110px;

          .collect-btn, .heart-btn {
            margin-right: 15px;
            &.heart-btn {

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
          }
        }
        .list-creator {
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
          
          .bottom-text {
            color: #fffc;

            .hearting {
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