import {
  AppShell,
  Stack,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  UnstyledButton,
  Badge,
  Menu,
  Avatar,
  Divider,
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
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';

const navItems = [
  { label: 'Dashboard', icon: IconLayoutDashboard, path: '/seller/dashboard' },
  { label: 'Products', icon: IconPackage, path: '/seller/products' },
  { label: 'Auctions', icon: IconGavel, path: '/seller/auctions' },
];

type SellerSidebarContentProps = {
  navbarOpened: boolean;
  toggle: () => void;
};

export default function SellerSidebar({ navbarOpened, toggle } : SellerSidebarContentProps ) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_info') || 'null');
    } catch {
      return null;
    }
  });
  const isMobile = useMediaQuery('(max-width: 767px)');

  const closeIfMobile = () => {
    if (isMobile && navbarOpened) toggle();
  };

  const doLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    setUserInfo(null);
    navigate('/login');
    closeIfMobile();
  };

  const userBalance = '1,204.00';

  return (
    <AppShell.Navbar
      p="md"
      style={{
        position: 'relative',
        backgroundColor: '#1F2937',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Toggle button */}
      <Tooltip label="Toggle sidebar" position="right" withArrow>
        <ActionIcon
          variant="filled"
          color="orange"
          radius="xl"
          size="lg"
          onClick={toggle}
          style={{
            position: 'absolute',
            top: '50%',
            right: '-14px',
            transform: 'translateY(-50%)',
            zIndex: 3000,
            boxShadow: '0 0 6px rgba(0,0,0,0.25)',
            transition: 'all 0.3s ease',
          }}
        >
          {navbarOpened ? <IconChevronLeft size={18} /> : <IconChevronRight size={18} />}
        </ActionIcon>
      </Tooltip>

      {/* Brand */}
      <AppShell.Section px="md" py="lg">
        <UnstyledButton
          onClick={() => navigate('/')}
          style={{
            marginLeft: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Text fw={700} size="lg" c="#FF7A00">
            Seller Management
          </Text>
        </UnstyledButton>
      </AppShell.Section>

      {/* Navigation */}
      <AppShell.Section grow px="md">
        <Stack gap={4}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Group
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  closeIfMobile();
                }}
                style={{
                  cursor: 'pointer',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: isActive ? 'white' : '#E5E7EB',
                  backgroundColor: isActive ? '#FF7A00' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <item.icon size={18} />
                <Text fw={500}>{item.label}</Text>
              </Group>
            );
          })}
        </Stack>
      </AppShell.Section>

      {/* Footer */}
      <AppShell.Section px="md" py="lg">
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
            BALANCE: ${userBalance}
          </Badge>

          <Group gap={12} align="center">
            <ActionIcon
              variant="subtle"
              aria-label="Go to home"
              radius="xl"
              size={36}
              color="gray"
              onClick={() => {
                navigate('/');
                closeIfMobile();
              }}
            >
              <IconHome size={18} />
            </ActionIcon>

            <ActionIcon variant="subtle" aria-label="Notifications" radius="xl" size={36} color="gray">
              <IconBell size={18} />
            </ActionIcon>

            <Menu
              withinPortal={false}
              position="bottom-start"
              offset={10}
              width={180}
              shadow="md"
              zIndex={2000}
              styles={{
                dropdown: {
                  marginLeft: "45px",
                },
              }}
            >
              <Menu.Target>
                <Avatar radius="xl" color="blue" style={{ cursor: 'pointer' }} title={userInfo?.username || 'User'}>
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
