<template>
  <div class="comment-type-block" v-if="comments && (comments[t].length > 0)" v-for="t in type" :key="`list-${t}`">
    <div class="comment-type-title">{{t.toUpperCase()}}</div>
    <div class="comments-list">
      <div class="comment-item" v-for="item in comments[t]" :key="item.id">
        <img class="user-avatar" :src="`${item.user.avatarUrl}?param=50y50`">
        <div class="comment-content">
          <div class="user-name-block">
            <b class="user-name">{{item.user.nickname}}</b>
            <span class="pl_20 comment-time">{{getTime(item.time)}}</span>
          </div>
          <div class="content">{{item.content}}</div>
          <blockquote v-if="item.beReplied && item.beReplied[0]" class="be-replied">
            <span class="user-name">@{{item.beReplied[0].user.nickname}}</span>
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
</template>

<script>
  export default {
    name: "Comment",
    data() {
      return {
        comments: null,
        loading: false,
        type: ['hot', 'latest'],
      }
    }
  }
</script>

<style scoped>

</style>