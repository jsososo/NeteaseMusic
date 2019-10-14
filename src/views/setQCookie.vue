<template>
  <div style="width: 80%;margin: 0 auto;">
    <el-input type="text" v-model="inputCookie" />
    <el-button class="mt_20" @click="sendCookie">发送</el-button>
  </div>
</template>

<script>
  import request from '../assets/utils/request';
  export default {
    name: "setQCookie",
    data() {
      return {
        inputCookie: '',
      }
    },
    created() {
      this.$store.dispatch('updateShowCover', false);
    },
    methods: {
      sendCookie() {
        console.log(this.inputCookie);
        request({
          api: 'QQ_SET_COOKIE',
          method: 'post',
          data: {
            data: this.inputCookie,
          }
        }).then((res) => {
          if (res.result === 100) {
            this.$message.success('ok')
          } else {
            this.$message.error('no ok')
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>