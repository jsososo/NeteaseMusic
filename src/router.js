import Vue from 'vue'
import Router from 'vue-router'

const User = () => import('./views/User');
const Search = () => import('./views/Search');
const PlayList = () => import('./views/PlayList');
const PlayListDetail = () => import('./views/PlayListDetailPage');
const Singer = () => import('./views/Singer');
const Comment = () => import('./views/Comment');
const Lyric = () => import('./views/Lyric');
const Album = () => import('./views/Album');
const About = () => import('./views/About');
const Download = () => import('./views/Download');
const SetQCookie = () => import('./views/setQCookie');
const Simple = () => import('./views/Simple');
const Mv = () => import('./views/Mv');
const Setting = () => import('./views/Setting');
const Feedback = () => import('./views/Feedback');
const Top = () => import('./views/Top');

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/simple',
      name: 'simple',
      component: Simple,
    },
    {
      path: '/setQCookie',
      name: 'setQCookie',
      component: SetQCookie,
    },
    {
      path: '/singer',
      name: 'singer',
      component: Singer,
    },
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
    },
    {
      path: '/album',
      name: 'album',
      component: Album,
    },
    {
      path: '/about',
      name: 'About',
      component: About,
    },
    {
      path: '/download',
      name: 'Download',
      component: Download,
    },
    {
      path: '/mv',
      name: 'Mv',
      component: Mv,
    },
    {
      path: '/setting',
      name: 'Setting',
      component: Setting,
    },
    {
      path: '/feedback',
      name: 'Feedback',
      component: Feedback,
    },
    {
      path: '/top',
      name: 'Top',
      component: Top,
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
  ['Simple', 'Mv'].forEach((name) => {
    if (to.name !== name && VUE_APP.$store.getters.getMode === name.toLowerCase()) {
      dispatch('updateMode', '');
    }
  });
  switch (to.name) {
    case 'user':
    case 'Download':
    case 'About':
    case 'Mv':
    case 'Feedback':
    case 'Top':
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