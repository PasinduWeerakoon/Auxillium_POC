import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import Playground from '../pages/Playground';
import Preview from '../pages/Preview';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/playground" replace />,
      },
      {
        path: 'playground',
        element: <Playground />,
      },
      {
        path: 'preview',
        element: <Preview />,
      },
    ],
  },
]);
export default router;
