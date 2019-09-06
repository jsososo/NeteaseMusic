<template>
  <div :class="`comments-page-container ${show && 'show'}`" @scroll="onScroll">
    <div class="comment-type-block" v-if="comments && (comments[t].length > 0)" v-for="t in type" :key="`list-${t}`">
      <div class="comment-type-title">{{t.toUpperCase()}}</div>
      <div class="comments-list">
        <div class="comment-item" v-for="item in comments[t]" :key="item.id">
          <img class="user-avatar" :src="`${item.user.avatarUrl}?param=50y50`">
          <div class="comment-content">
            <div class="user-name-block">
              <a :href="`#/user?id=${item.user.userId}`"><b class="user-name">{{item.user.nickname}}</b></a>
              <span class="pl_20 comment-time">{{getTime(item.time)}}</span>
            </div>
            <div class="content">{{item.content}}</div>
            <blockquote v-if="item.beReplied && item.beReplied[0]" class="be-replied">
              <a :href="`#/user?id=${item.user.userId}`" class="user-name">@{{item.beReplied[0].user.nickname}}</a>
              ：{{item.beReplied[0].content}}
            </blockquote>
            <div class="mt_10">
              <i @click="likeComment(item, t)" :class="`iconfont pointer ${item.newLike} icon-zan${item.liked ? '' : '-o'}`" />
              <span class="pl_10 ft_12">{{numberHandle(item.likedCount)}}</span>
              <i class="iconfont icon-delete ml_20 pointer" @click="delComment(item.commentId)" v-if="item.user.userId === user.userId" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import request from '../assets/utils/request';
  import timer from '../assets/utils/timer';
  import { mapGetters } from 'vuex';
  import $ from 'jquery';
  export default {
    name: "Comment",
    props: {
      commentType: Number,
      id: Number,
      comments: Object,
    },
    data() {
      return {
        loading: false,
        show: false,
        type: ['hot', 'latest'],
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        user: 'getUser',
        playingPercent: 'getPlayingPercent',
      })
    },
    created() {
      setTimeout(() => this.show = true);
    },
    methods: {
      async delComment(commentId) {
        const { id, commentType, playNow } = this;
        const { comments } = [playNow][commentType];
        try {
          const confirm = await this.$confirm('确认删除？');
          if (confirm !== 'confirm') {
            return;
          }
          const res = await request({
            api: 'COMMENT',
            data: {
              t: 0,
              type: commentType,
              id,
              commentId,
            },
            cache: true,
          });
          if (res.code === 200) {
            comments.hot = comments.hot.filter((item) => item.commentId !== commentId);
            comments.latest = comments.latest.filter((item) => item.commentId !== commentId);
            comments.total -= 1;
            this.$store.dispatch(['updateSongDetail'][commentType], { id, comments });
            this.$message.success('删除成功');
          } else {
            this.$message.error('删除失败');
          }
        } catch (err) {
          console.log(err);
        }
      },
      getComments() {
        const { playNow, commentType } = this;
        const { comments, id } = [playNow][commentType];
        if (!comments) {
          return false;
        }
        const { offset, total } = comments;
        const limit = 20;
        if (((offset + limit) > total) || this.loading) {
          return;
        }
        this.loading = true;
        request({
          api: ['MUSIC_COMMENTS'][commentType],
          data: { offset, limit: 20, total, id }
        }).then((res) => {
          comments.offset += limit;
          comments.total = res.total;
          comments.latest = [ ...comments.latest, ...res.comments ];
          this.loading = false;
          this.$store.dispatch(['updateSongDetail'][commentType], { id, comments });
        })
      },
      onScroll() {
        const { comments, loading } = this;
        if (!comments) {
          return;
        }
        const { offset, total } = comments;
        const el = $('.comments-page-container');
        const viewH = el.height(); // 可见高度
        const contentH = el.get(0).scrollHeight; // 内容高度
        const scrollTop = el.scrollTop(); // 滚动高度
        if (contentH - viewH - scrollTop < 300 && offset < total && !loading) {
          this.getComments();
        }
      },
      getTime(t) {
        return timer(t).str('YY-MM-DD HH:mm:ss');
      },
      numberHandle(n) {
        return n > 1000 ? `${Number(n / 1000).toFixed(1)}k` : n
      },
      likeComment(c, type) {
        const { playNow, commentType } = this;
        const t = Number(!c.liked);
        request({
          api: 'LIKE_COMMENT',
          data: {
            t,
            type: commentType,
            cid: c.commentId,
            id: this.id,
          }
        }).then((res) => {
          if (!res) {
            return;
          }
          const comment = [playNow][commentType].comments[type].find((cItem) => cItem.commentId === c.commentId);
          comment.likedCount += t * 2 - 1;
          comment.liked = !c.liked;
          comment.newLike = !c.liked ? '' : 'new-like';
          this.$store.dispatch(['updateSongDetail'][commentType], playNow);
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .comments-page-container {
    width: 40%;
    position: absolute;
    height: calc(100% - 50px);
    left: 110%;
    overflow: auto;
    background: #0001;
    border-left: 1px solid #fff8;
    transition: 0.3s;
    opacity: 0;


    &.show {
      left: 60%;
      opacity: 1;
    }

    &::-webkit-scrollbar {
      width: 0;
      height:8px;
      background-color:rgba(0,0,0,0);
    }

    .comment-type-block {
      .comment-type-title {
        height: 20px;
        font-size: 100px;
        color: #fff2;
        font-weight: bold;
      }

      .comments-list {
        padding-top: 50px;
        .comment-item {
          margin-bottom: 10px;
          color: #fffa;
          padding: 15px 10px;
          background: #0002;
          width: calc(100% - 60px);
          margin-left: 20px;
          border-radius: 10px;
          transition: 0.5s;

          &:hover {
            background: #0004;
            color: #fff;
          }

          .user-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-top: 5px;
          }

          .comment-content {
            width: calc(100% - 80px);
            display: inline-block;
            vertical-align: top;
            padding-left: 20px;

            .user-name {
              cursor: pointer;
              &:hover {
                text-decoration: underline;
              }
            }

            .user-name-block {
              font-weight: bold;
              font-size: 18px;
              opacity: 0.7;

              .comment-time {
                font-size: 12px;
                font-weight: normal;
              }
            }
            .content {
              margin-top: 10px;
              opacity: 0.7;
            }
            .be-replied {
              margin-top: 5px;
              padding: 5px 10px;
              border-left: 5px solid #fff8;
              opacity: 0.7;
            }
          }

          .iconfont.new-like {
            animation: likeAnimation 0.5s;

            @keyframes likeAnimation {
              from, to {
                transform: rotate(0deg);
              }
              50% {
                transform: rotate(-30deg);
              }
            }
          }
        }
      }
    }
  }
</style>