import Vue from 'vue'
import Router from 'vue-router'
import Player from './views/PlayerPage'
import ImportPage from './views/Import';
import Version from './views/Version';
import Download from './views/Download';
import MobileDown from './views/MobileDown';
import Search from './views/Search';
import PlayList from './views/PlayList';
import PlayListDetail from './views/PlayListDetail';
import User from './views/User';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/user',
      name: 'user',
      component: User,
    },
    {
      path: '/playlist/detail',
      name: 'playlistdetail',
      component: PlayListDetail,
      meta: {
        title: '',
      }
    },
    {
      path: '/playlist',
      name: 'playlist',
      component: PlayList,
      meta: {
        title: '我的歌单',
      }
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
      meta: {
        title: '搜索',
      }
    },
    {
      path: '/import',
      name: 'import',
      component: ImportPage,
      meta: {
        title: '导入',
      }
    },
    {
      path: '/version',
      name: 'version',
      component: Version,
      meta: {
        title: '更新记录',
      }
    },
    {
      path: '/download',
      name: 'download',
      component: Download,
      meta: {
        title: '下载中心',
      }
    },
    {
      path: '/m/d',
      name: 'mobileDown',
      component: MobileDown,
      meta: {
        title: '手机下载'
      }
    }
  ]
});

router.beforeEach((to, from, next) => {
  /* 路由发生变化 */
  const VUE_APP = window.VUE_APP;
  if (!VUE_APP || !VUE_APP.$store) {
    return next();
  }
  const { dispatch } = VUE_APP.$store;
  switch (to.name) {
    case 'user':
      dispatch('updateShowCover', false);
      break;
    default:
      dispatch('updateShowCover', true);
  }
  // if (to.meta.title) {
  //   document.title = to.meta.title
  // }
  next()
});

export default router;