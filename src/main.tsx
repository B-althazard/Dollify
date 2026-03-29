import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';

import { AppShell } from './shell/AppShell';
import './styles.css';

const router = createHashRouter(
  [
    {
      path: '/',
      element: <AppShell />,
    },
    {
      path: '/build',
      element: <AppShell />,
    },
    {
      path: '/gen',
      element: <AppShell />,
    },
    {
      path: '/gallery',
      element: <AppShell />,
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ],
  {
    basename: '/Dollify',
  },
);

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
