<template>
  <div class="song-info-container">
    <div class="info-row">
      <span class="info-key">歌名：</span>
      <span>{{playNow.name}} <span v-if="playNow.br" :class="`song-format ${playNow.format}`">{{playNow.br / 1000}}k</span></span>
      <div class="ft_12 mt_5" style="margin-left: 58px; opacity: 0.7">{{playNow.alia.join('、')}}</div>
    </div>
    <div class="info-row">
      <span class="info-key">歌手：</span>
      <span>{{playNow.ar.map((a) => a.name).join('/')}}</span>
    </div>
    <div class="info-row">
      <span class="info-key">专辑：</span>
      <span>{{playNow.al.name}}</span>
    </div>
    <div class="info-row pointer" v-if="playNow.comment && playNow.comment.length > 0" @click="$store.dispatch('changeShowComment')">
      查看评论
    </div>
  </div>
</template>

<script>
  export default {
    name: "SongInfo",
    computed: {
      playNow() {
        return this.$store.getters.getPlaying;
      }
    },
    data() {
      return {
        formatMap: {
          size128: '128k',
          size320: '320k',
          sizeflac: '无损',
        }
      }
    }
  }
</script>

<style lang="scss">
  .song-info-container {
    color: white;
    padding-left: 30px;
    font-size: 16px;
    margin-top: 50px;
    width: 400px;

    .info-row {
      margin-bottom: 10px;
    }

    .song-format {
      font-size: 8px;
      border: 1px solid white;
      opacity: 0.8;
      padding: 0 2px;
      margin-left: 10px;
      vertical-align: 2px;
    }

    .info-key {
      padding-right: 10px;
    }
  }
</style>