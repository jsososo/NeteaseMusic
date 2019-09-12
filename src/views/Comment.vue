<template>
  <div>
    <CommentComponent :comment-type="0" :id="playNow.id" :comments="comments" />

    <SendComment :type="0" :success-cb="initComments" />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import request from '../assets/utils/request';
  import timer from '../assets/utils/timer';
  import SendComment from '../components/SendComment';
  import CommentComponent from '../components/CommentComponent';
  import $ from 'jquery';
  export default {
    name: "Comment",
    components: { SendComment, CommentComponent },
    data() {
      return {
        comments: null,
        loading: false,
        type: ['hot', 'latest'],
        show: false,
      }
    },
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        user: 'getUser',
      })
    },
    watch: {
      playNow({ comments }) {
        this.comments = comments;
      }
    },
    created() {
      this.comments = this.playNow.comments;
      this.$store.dispatch('updateCommentInfo', { type: 0, id: 0, val: '', title: '', open: false });
    },
    methods: {
      async delComment(commentId) {
        const { id, comments } = this.playNow;
        try {
          const confirm = await this.$confirm('确认删除？');
          if (confirm !== 'confirm') {
            return;
          }
          const res = await request({
            api: 'COMMENT',
            data: {
              t: 0,
              type: 0,
              id,
              commentId,
            },
            cache: true,
          });
          if (res.code === 200) {
            comments.hot = comments.hot.filter((item) => item.commentId !== commentId);
            comments.latest = comments.latest.filter((item) => item.commentId !== commentId);
            comments.total -= 1;
            this.$store.dispatch('updateSongDetail', { id, comments });
            this.$message.success('删除成功');
          } else {
            this.$message.error('删除失败');
          }
        } catch (err) {
          console.log(err);
        }
      },
      initComments(res) {
        const { comments } = this.playNow;
        comments.latest.unshift(res);
        this.$message.success('发送成功~');
        this.$store.dispatch('updateCommentInfo', { type: 0, id: 0, val: '', title: '', open: false });
      },
      clickPlane() {
        const { commentInfo, playNow } = this;
        if (!commentInfo.id) {
          this.commentInfo = {
            id: playNow.id,
            name: playNow.name,
          }
        }
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>