import { Outlet } from 'react-router';
import { SidebarInset, SidebarProvider } from '@tetap/ui';
import { AdminHeader } from './header.js';
import { AppSidebar } from './app-sidebar.js';
import { AdminMain } from './main.js';

const getSidebarDefaultOpen = () => {
  if (typeof document === 'undefined') {
    return true;
  }

  return !document.cookie.includes('sidebar_state=false');
};

export const AdminShell = () => (
  <SidebarProvider defaultOpen={getSidebarDefaultOpen()}>
    <AppSidebar />
    <SidebarInset>
      <AdminHeader />
      <AdminMain>
        <Outlet />
      </AdminMain>
    </SidebarInset>
  </SidebarProvider>
);
