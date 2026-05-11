import { Outlet } from 'react-router';
import { SidebarInset, SidebarProvider } from '@tetap/ui';
import { AppSidebar } from './app-sidebar.js';

const getSidebarDefaultOpen = () => {
  if (typeof document === 'undefined') {
    return true;
  }

  return !document.cookie.includes('sidebar_state=false');
};

export const AdminShell = () => (
  <SidebarProvider defaultOpen={getSidebarDefaultOpen()}>
    <AppSidebar />
    <SidebarInset className="@container/content has-data-[layout=fixed]:h-svh peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]">
      <Outlet />
    </SidebarInset>
  </SidebarProvider>
);
