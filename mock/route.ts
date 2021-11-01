export default {
  '/api/auth_routes': {
    '/form/advanced-form': { authority: ['admin', 'user'] },
  },
  '/api/routes': {
    code: '00000',
    message: '成功',
    data: [
      {
        name: 'dashboard',
        key: '/dashboard',
        path: '/dashboard',
        icon: 'icon-dashboard',
        menuType: 0,
        children: [
          {
            name: 'analysis',
            path: '/dashboard/analysis',
            key: '/dashboard/analysis',
            renderType: 0,
            menuType: 1,
            component: 'dashboard/Analysis',
          },
          {
            name: 'monitor',
            path: '/dashboard/monitor',
            key: '/dashboard/monitor',
            renderType: 0,
            menuType: 1,
            component: 'dashboard/Monitor',
          },
          {
            name: 'workplace',
            path: '/dashboard/workplace',
            key: '/dashboard/workplace',
            renderType: 1,
            menuType: 1,
            targetUrl: 'https://www.163.com/',
          },
        ],
      },
      {
        name: 'account',
        key: '/account',
        path: '/account',
        icon: 'icon-setting',
        menuType: 0,
        children: [
          {
            name: 'center',
            path: '/account/center',
            key: '/account/center',
            renderType: 0,
            menuType: 1,
            component: 'account/Center',
          },
          {
            name: 'settings',
            path: '/account/settings',
            key: '/account/settings',
            renderType: 0,
            menuType: 1,
            component: 'account/Settings',
          },
        ],
      },
    ]
  },
};
