import Vue from 'vue'
import Router from 'vue-router'
import Search from './views/Search';
import PlayList from './views/PlayList';
import PlayListDetail from './views/PlayListDetail';
import User from './views/User';
import Lyric from './views/Lyric';
import Comment from './views/Comment';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/recommend',
      name: 'recommend',
      component: PlayList,
    },
    {
      path: '/comment',
      name: 'comment',
      component: Comment,
    },
    {
      path: '/',
      name: 'lyric',
      component: Lyric,
    },
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