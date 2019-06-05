<template>
  <div :class="`play-cd-container pl_20 playing-${$store.state.playing} loading-${$store.state.loading}`">
    <div class="cd-bg">
      <img v-if="playNow.al.picUrl" :src="playNow.al.picUrl" onerror="this.src='https://y.gtimg.cn/music/photo_new/T002R300x300M000001ZaCQY2OxVMg.jpg'">
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    name: "Cd",
    computed: {
      ...mapGetters({
        playNow: 'getPlaying',
        playing: 'isPlaying',
        loading: 'isLoading',
      }),
    }
  }
</script>

<style lang="scss">
  .loading-false .cd-bg {
    animation: cdRotate 30s infinite linear;
  }
  .playing-true .cd-bg {
    text-align: center;
    animation-play-state: running;
  }

  .playing-false .cd-bg {
    animation-play-state: paused;
  }

  /*@keyframes cdRotate {*/
    /*from {*/
      /*-webkit-transform: rotate(0deg);*/
    /*}*/
    /*to {*/
      /*transform: rotate(360deg);*/
    /*}*/
  /*}*/

  .cd-bg {
    width: 300px;
    height: 300px;
    background: url("../../assets/img/cd.png") no-repeat;
    background-size: 300px 300px;
    position: relative;

    img {
      position: absolute;
      top: 60px;
      left: 60px;
      width: 180px;
      height: 180px;
      border-radius: 50%;
    }
  }
</style>