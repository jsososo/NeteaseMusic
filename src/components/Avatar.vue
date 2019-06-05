<template>
  <div class="user-avatar">
    <i class="iconfont icon-yonghu" v-if="!user.avatarUrl" style="font-size: 25px;" @click="clickAvatar" />
    <img class="avatar-img" :src="user.avatarUrl" v-if="user.avatarUrl" style="font-size: 25px;" @click="clickAvatar" />
    <el-dialog
      width="400px"
      :visible.sync="showLoginDialog"
      :before-close="clickAvatar"
      :center="false"
    >
      <div style="width: 400px; text-align: left">
        <div class="dialog-label">手机/邮箱：</div>
        <el-input style="width: 200px;margin-left: 10px" v-model="username"/>
      </div>
      <div style="width: 400px; text-align: left">
        <div class="dialog-label">密码：</div>
        <el-input show-password type="password" style="width: 200px;margin-left: 10px" v-model="password"/>
      </div>
      <!--<div style="width: 400px; text-align: left">-->
        <!--<div class="dialog-label">优先听：</div>-->
        <!--<el-select style="width: 200px;margin-left: 10px" v-model="listenSize">-->
          <!--<el-option-->
            <!--v-for="item in sizeArr"-->
            <!--v-if="!item.type || item.type === 'listen'"-->
            <!--:key="item.val"-->
            <!--:label="item.label"-->
            <!--:value="item.val">-->
          <!--</el-option>-->
        <!--</el-select>-->
      <!--</div>-->
      <!--<div style="width: 400px; text-align: left">-->
        <!--<div class="dialog-label">优先下：</div>-->
        <!--<el-select style="width: 200px;margin-left: 10px" v-model="downSize">-->
          <!--<el-option-->
            <!--v-for="item in sizeArr"-->
            <!--v-if="!item.type || item.type === 'down'"-->
            <!--:key="item.val"-->
            <!--:label="item.label"-->
            <!--:value="item.val">-->
          <!--</el-option>-->
        <!--</el-select>-->
      <!--</div>-->
      <!--<div style="width: 400px; text-align: left" v-if="downSize === 'high'">-->
        <!--<div class="dialog-label">无损格式：</div>-->
        <!--<el-radio-group v-model="downHigh">-->
          <!--<el-radio label="sizeflac">flac</el-radio>-->
          <!--<el-radio label="sizeape">ape</el-radio>-->
        <!--</el-radio-group>-->
      <!--</div>-->
      <div>
        <el-button class="login-btn mt_20" style="width: 200px;" type="primary" @click="login">ok！</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Storage from '../assets/utils/Storage';
  import request from '../assets/utils/request';
  import { mapGetters } from 'vuex';
  export default {
    name: "Avatar",
    computed: {
      ...mapGetters({
        user: 'getUser',
      })
    },
    data() {
      return {
        showLoginDialog: false,
        username: '',
        password: '',
        listenSize: Storage.get('listen_size'),
        downSize: Storage.get('down_size'),
        downHigh: Storage.get('down_high'),
        sizeArr: [
          { label: '128k', val: 'size128' },
          { label: '320k', val: 'size320' },
          // { label: '无损ape', val: 'sizeape' },
          { label: '无损', val: 'sizeflac', type: 'listen' },
          { label: '无损', val: 'high', type: 'down' },
        ],
      }
    },
    watch: {
      listenSize(v) {
        Storage.set('listen_size', v);
        this.$message.success('修改成功，下一首生效');
      },
      downSize(v) {
        Storage.set('down_size', v);
        this.$message.success('修改成功，下一首生效');
      },
      downHigh(v) {
        Storage.set('down_high', v);
        this.$message.success('修改成功，下一首生效');
      }
    },
    methods: {
      clickAvatar() {
        this.username = Storage.get('uQ');
        this.showLoginDialog = !this.showLoginDialog;
      },
      login() {
        const { username, password } = this;
        const params = {
          password,
        };
        let api = '163_LOGIN_PHONE';
        if (username.match(/@/)) {
          api = '163_LOGIN_EMAIL';
          params.email = username;
        } else {
          params.phone = username;
        };

        request({ api, data: params, method: 'post' })
          .then((res) => {
            console.log(res);
          })
        // Storage.set('uQ', this.username);
        // if (this.username) {
        //   request.getQQList();
        // }
        // this.showLoginDialog = false;
      },
    }
  }
</script>

<style lang="scss" scoped>
  .user-avatar {
    display: inline-block;
    color: white;
    text-align: center;
    line-height: 40px;
    margin-left: 30px;
    cursor: pointer;
    vertical-align: middle;

    .avatar-img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }
  .dialog-label {
    width: 80px;
    padding-right: 10px;
    text-align: right;
    display: inline-block;
  }
  .user-avatar, .user-avatar-img {
    width: 40px;
    height: 40px;
    border: 1px solid white;
    border-radius: 50%;
  }
  .login-btn {
    width: 95px;
  }
</style>