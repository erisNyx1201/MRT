const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('pages/MatchesPage.vue') },
      {
        path: 'team',
        children: [{ path: '', component: () => import('pages/database/TeamManager.vue') }],
      },
      {
        path: 'room',
        children: [{ path: '', component: () => import('pages/RoomPage.vue') }],
      },
      {
        path: 'live',
        children: [
          // { path: '', component: () => import('pages/LivePage.vue') },
          { path: 'dashboard', name: 'DashboardPage', component: () => import('pages/DashboardPage.vue') },
        ],
      },
      {
        path: 'test',
        // children: [{ path: '', component: () => import('pages/test/LiveDashboard.vue') }],
        children: [{ path: '', component: () => import('pages/test/LiveObjective.vue') }],
      },
    ],
  },

  // Always leave this as last one,ß
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
