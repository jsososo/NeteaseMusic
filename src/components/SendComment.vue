<template>
  <div :class="`write-comment-container ${commentInfo.open && 'open'}`">
    <div class="comment-main">
      <div class="ft_14 pl_5" style="color: #fff9; line-height: 20px"> 为 <span class="comment-title">{{commentInfo.title}}</span> 献上评论</div>
      <textarea
        class="comment-input"
        :rows="2"
        placeholder="说些啥呢"
        v-model="commentInfo.val">
      </textarea>
    </div>
    <i class="iconfont icon-cancel pointer" @click="closeComment"></i>
    <div class="plane-icon" @click="clickPlane">
      <i class="iconfont icon-plane pointer" />
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import request from '../assets/utils/request';

  export default {
    name: "SendComment",
    props: {
      successCb: Function,
    },
    data() {
      return {
        loading: false,
      }
    },
    computed: {
      ...mapGetters({
        commentInfo: 'getCommentInfo',
        playNow: 'getPlaying',
      })
    },
    methods: {
      clickPlane() {
        const { commentInfo } = this;
        let id = 0, title = commentInfo.title;
        if (commentInfo.open) {
          if (!commentInfo.val) {
            return this.$message.warning('无话可说？');
          } else {
            if (this.loading) {
              return;
            }
            this.loading = true;
            request({
              api: 'COMMENT',
              data: {
                t: 1,
                type: commentInfo.type,
                id: commentInfo.id,
                content: commentInfo.val,
              },
              cache: true,
            }).then((res) => {
              this.loading = false;
              this.successCb(res.comment);
            }, () => this.$message.error('评论失败了'));
          }
        } else {
          switch (commentInfo.type) {
            case 0:
              id = this.playNow.id;
              title = this.playNow.name;
              break;
          }
          this.$store.dispatch('updateCommentInfo', { id, title, open: true });
        }
      },
      closeComment() {
        this.$store.dispatch('updateCommentInfo', { open: false });
      }
    }
  }
</script>

<style lang="scss" scoped>
  .write-comment-container {
    position: fixed;
    bottom: 120px;
    right: 40px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #F23C3C;
    border: 2px solid #F23C3C;
    opacity: 0.3;
    font-size: 0;
    cursor: pointer;
    box-shadow: 0 0 20px #333;
    transition: 0.3s;
    overflow: hidden;
    z-index: 10;

    &:hover {
      opacity: 0.8;
    }

    &.open {
      opacity: 0.8;
      width: calc(40% - 80px);
      height: 120px;
      background: #000d;
      border: 2px solid #fff3;
      border-radius: 20px;
      cursor: default;
      z-index: 10;

      .comment-main, .icon-cancel {
        opacity: 1;
      }
      .plane-icon {
        bottom: 5px;
      }
    }

    .plane-icon {
      color: #fff;
      text-align: center;
      position: absolute;
      right: 0;
      bottom: 0;
      width: 50px;
      transition: 0.3s;

      .icon-plane {
        line-height: 50px;
        font-size: 24px !important;
      }
    }

    .icon-cancel {
      position: absolute;
      bottom: 80px;
      right: 20px;
      color: #fffc;
      font-size: 14px !important;
      transition: 0.3s;
      opacity: 0;
    }

    .comment-main {
      position: absolute;
      right: 65px;
      bottom: 15px;
      width: calc(100% - 80px);
      color: #fffc;
      transition: 0.3s;
      opacity: 0;

      .comment-title {
        display: inline-block;
        max-width: 150px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: -6px;
      }

      .comment-input {
        background: transparent !important;
        width: 100%;
        height: 70px;
        font-size: 14px;
        border: none !important;
        color: #fffc;
        outline: none !important;
        resize: none;
      }
    }
  }
</style>