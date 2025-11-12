import { AppShell, AppShellMain } from '@mantine/core';
import SellerSidebar from '../components/SellerSidebar';
import { Outlet } from 'react-router-dom';

export default function SellerLayout() {
  return (
    <AppShell
      navbar={{ width: 240, breakpoint: 'sm' }}
      padding="md"
    >
      <SellerSidebar />
      <AppShellMain bg="#f5f6f8">
        <Outlet />
      </AppShellMain>
    </AppShell>
  );
}

