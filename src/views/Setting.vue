<template>
  <div style="padding-left: 100px; max-height: calc(100vh - 120px); min-height: 600px;" class="hide-scroll">
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