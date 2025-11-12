import { AppShell, AppShellMain } from '@mantine/core';
import SellerSidebar from '../components/SellerSidebar';
import SellerTopNav from '../components/SellerTopNav';
import { Outlet } from 'react-router-dom';

export default function SellerLayout() {
  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 'sm' }}
      padding="md"
    >
      <SellerTopNav />
      <SellerSidebar />
      <AppShellMain bg="#f5f6f8">
        <Outlet />
      </AppShellMain>
    </AppShell>
  );
}

