import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  NavLink as MantineNavLink,
  AppShell,
  Stack,
  Text,
  Group,
  UnstyledButton,
} from '@mantine/core';
import {
  IconPackage,
  IconGavel,
  IconLayoutDashboard,
} from '@tabler/icons-react';

// 👇 Gộp Dashboard vào chung navItems
const navItems = [
  {
    label: 'Dashboard',
    icon: IconLayoutDashboard,
    path: '/seller/dashboard',
  },
  {
    label: 'Products',
    icon: IconPackage,
    path: '/seller/products',
  },
  {
    label: 'Auctions',
    icon: IconGavel,
    path: '/seller/auctions',
  },
];

export default function SellerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AppShell.Navbar
      style={{
        backgroundColor: '#1F2937',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
      p={0}
    >
      {/* Brand Section (Logo + Name) */}
      <AppShell.Section px="md" py="lg">
        <UnstyledButton
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Text fw={700} size="sm" c="#FF7A00">
            Smart Auction Seller
          </Text>
        </UnstyledButton>
      </AppShell.Section>

      {/* Navigation Items */}
      <AppShell.Section grow px="md">
        <Stack gap={4}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <MantineNavLink
                key={item.path}
                component={NavLink}
                to={item.path}
                label={item.label}
                leftSection={
                  <item.icon
                    size={18}
                    style={{
                      color: isActive ? 'white' : '#E5E7EB',
                    }}
                  />
                }
                active={isActive}
                style={{
                  borderRadius: 'var(--mantine-radius-md)',
                  padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
                  color: isActive ? 'white' : '#E5E7EB',
                  backgroundColor: isActive ? '#FF7A00' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      backgroundColor: isActive
                        ? '#FF7A00'
                        : 'rgba(255,122,0,0.1)',
                    },
                  },
                  label: {
                    color: isActive ? 'white' : '#E5E7EB',
                    fontWeight: isActive ? 600 : 400,
                  },
                }}
              />
            );
          })}
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
