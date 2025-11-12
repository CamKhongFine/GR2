import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  NavLink as MantineNavLink,
  AppShell,
  Stack,
  Text,
  Group,
  UnstyledButton,
  Badge,
  Menu,
  Avatar,
  Divider,
  ActionIcon,
} from '@mantine/core';
import {
  IconPackage,
  IconGavel,
  IconLayoutDashboard,
  IconHome,
  IconBell,
  IconLogout,
  IconUser,
  IconSettings,
} from '@tabler/icons-react';
import { useState } from 'react';

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
  const [userInfo, setUserInfo] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('user_info') || 'null'); } catch { return null; }
  });

  const userBalance = '1,204.00';

  const doLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    setUserInfo(null);
    navigate('/login');
  };

  return (
    <AppShell.Navbar
      style={{
        backgroundColor: '#1F2937',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
      }}
      p={0}
    >
      {/* Brand Section (Logo + Name) */}
      <AppShell.Section px="md" py="lg">
        <UnstyledButton
          style={{
            marginLeft: '17px',
            marginTop: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onClick={() => navigate('/')}
        >
          <Text fw={700} size="lg" c="#FF7A00">
            Seller Management
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

      <AppShell.Section
        px="md"
        py="lg"
        style={{
          marginTop: 'auto',
        }}
      >
        <Stack gap="sm" align="center">
          <Badge
            variant="filled"
            style={{
              backgroundColor: '#FF7A00',
              color: 'white',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 6,
            }}
          >
            Balance: ${userBalance}
          </Badge>

          <Group gap={12} align="center">
            <ActionIcon
              variant="subtle"
              aria-label="Go to home"
              radius="xl"
              size={36}
              color="gray"
              onClick={() => navigate('/')}
            >
              <IconHome size={18} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              aria-label="Notifications"
              radius="xl"
              size={36}
              color="gray"
            >
              <IconBell size={18} />
            </ActionIcon>

            <Menu
              withinPortal={false}
              position="top-end"
              offset={100}
              width={180}
              shadow="md"
              zIndex={2000}
              styles={
                {
                  dropdown: {
                    transform: 'translateX(25px)',
                  },
                }
              }
            >
              <Menu.Target>
                <Avatar
                  radius="xl"
                  color="blue"
                  style={{ cursor: 'pointer' }}
                  title={userInfo?.username || 'User'}
                >
                  {(userInfo?.username?.[0] || 'U').toUpperCase()}
                </Avatar>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{userInfo?.username || 'User'}</Menu.Label>
                <Menu.Item leftSection={<IconGavel size={16} />} onClick={() => navigate('/my-bids')}>
                  My Bids
                </Menu.Item>
                <Menu.Item leftSection={<IconUser size={16} />} onClick={() => navigate('/profile')}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => navigate('/settings')}>
                  Settings
                </Menu.Item>
                <Divider />
                <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={doLogout}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}

// Updated bottom controls: Balance + Bell + Avatar menu
