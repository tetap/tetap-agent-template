import { memo } from 'react';
import { Outlet } from 'react-router';
import { SidebarInset, SidebarProvider } from '@tetap/ui';
import { AppSidebar } from './app-sidebar.js';

const getSidebarDefaultOpen = () => {
  if (typeof document === 'undefined') {
    return true;
  }

  return !document.cookie.includes('sidebar_state=false');
};

export const AdminShell = memo(function AdminShell() {
  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden" defaultOpen={getSidebarDefaultOpen()}>
      <AppSidebar />
      <SidebarInset className="@container/content min-h-0 min-w-0 overflow-hidden">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
});
