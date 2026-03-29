import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AppShell } from './shell/AppShell';
import './styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
  },
], {
  basename: '/Dollify',
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
