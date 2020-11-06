<template>
  <div class="home-page-right">
    <Lyric v-if="homeType === 'info'" />
    <Playing v-else />
  </div>
</template>

<script>
  import Lyric from "../components/Lyric";
  import Playing from "../components/Playing";
  import { mapGetters } from 'vuex';
  export default {
    name: "Home",
    components: { Lyric, Playing },
    data() {
      return {

      }
    },
    computed: {
      ...mapGetters({
        homeType: 'getHomeType',
      })
    },
  }
</script>

<style lang="scss">
  .home-page-right {
    position: absolute;
    left: 60%;
    width: 40%;
    height: calc(100% - 50px);
    overflow: hidden;
  }
</style>