<template>
  <div>
    <CommentComponent :platform="playNow.platform || '163'" :comment-type="0" :id="playNow.id" :comments="comments" />

    <SendComment :type="0" :platform="playNow.platform || '163'" :success-cb="initComments" />
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
      initComments() {
        this.$message.success('发送成功~');
        this.$store.dispatch('updateCommentInfo', { type: 0, id: 0, val: '', title: '', open: false, success: true, });
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>