import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
// import KeepAlive from 'react-activation';

const Home = lazy(() => import(/* webpackChunkName: 'Home' */ 'views/home'))//首页


const homeRoutes: RouteObject[] = []

const routes: RouteObject[] = [
  {
    path: '/home',
    element: <Home />,
    children: homeRoutes
  },
  {
    path: '*',
    element: <Navigate to='/home' />
  },
];

export { homeRoutes, routes };