<template>
  <div style="padding-left: 100px;">
    <SettingComponent />
  </div>
</template>

<script>
  import SettingComponent from '../components/Setting';
  export default {
    name: "Setting",
    components: { SettingComponent },
    created() {
      this.$store.dispatch('updateShowCover', false);
    }
  }
</script>

<style scoped>

</style>