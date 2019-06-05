<template>
  <div class="comment-container">
    <div class="ft_20">
      <div class="inline-block mb_15 pointer" @click="$store.dispatch('changeShowComment')">
        <b><i class="pr_5 el-icon-arrow-left"></i></b>
        返回
      </div>
    </div>
    <div v-for="item in (playNow.comment || [])" :key="item.id" class="comment-detail">
      <img class="comment-avatar" :src="item.avatar" :alt="item.nick">
      <div class="inline-block pl_20" style="width: calc(100% - 100px);">
        <b class="comment-nick">{{item.nick}}</b>
        <span class="pl_15 comment-time">{{getTime(item.time)}}</span>
        <div class="comment-content" v-html="handleContent(item.content)"></div>
      </div>
    </div>
    <div v-if="(playNow.comment || []).length === 0" class="text-center pt_30">
      <b class="ft_18">没有评论呢</b>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import timer from '../assets/utils/timer';
  export default {
    name: "Comment",
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
      }),
    },
    methods: {
      handleContent(v) {
        return (v || '').replace(/^\\n/, '').replace(/\\n|\n/g, '<br/>')
      },
      getTime(v) {
        return timer(v * 1000).str('YY-MM-DD HH:mm')
      }
    }
  }
</script>

<style lang="scss">
  .comment-container {
    padding: 20px;
    color: #fff;

    .comment-detail {
      margin-bottom: 30px;
      &:first-line {
        line-height: 40px;
        vertical-align: top;
      }

      .comment-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
      .comment-content {
        opacity: 0.7;
      }
      .comment-nick, .comment-time  {
        line-height: 40px;
        vertical-align: top;
      }
    }
  }
</style>