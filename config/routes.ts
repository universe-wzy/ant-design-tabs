export default [
  {
    path: '/user',
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: '@/pages/user/Login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        component: '@/pages/404',
      },
    ],
  },
  {
    path: '/',
    component: '@/layouts/BasicLayout',
    routes: [
      // 该数组留空，通过服务端读取数据拼接全部路由
    ],
  },
  {
    component: '@/pages/404',
  },
];
