import { AppShell, Group, Image, Badge, ActionIcon, Avatar, Menu, UnstyledButton, Divider } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconBell, IconLogout, IconUser, IconSettings, IconGavel } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../assets/images/Logo.png';

export default function SellerTopNav() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('user_info') || 'null'); } catch { return null; }
  });

  const doLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    setUserInfo(null);
    navigate('/login');
  };

  return (
    <AppShell.Header
      style={{
        height: 56,
        backgroundColor: 'white',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        border: 'none',
      }}
      px="lg"
    >
      <Group justify="space-between" align="center" h="100%">
        {/* Left Section */}
        <UnstyledButton
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer',
          }}
        >
          <Group gap="sm">
            <Image src={Logo} alt="Smart Auction Seller" h={24} fit="contain" />
          </Group>
        </UnstyledButton>

        {/* Right Section */}
        <Group gap="md" style={{ marginRight: '28px' }}>
          {/* Balance Badge - Hidden on mobile */}
          {!isMobile && (
            <Badge
              color="orange"
              variant="light"
              radius="sm"
              size="lg"
            >
              Balance: $1,204.00
            </Badge>
          )}

          {/* Notification Icon - Hidden on mobile */}
          {!isMobile && (
            <ActionIcon variant="subtle" aria-label="Notifications">
              <IconBell size={18} />
            </ActionIcon>
          )}

          {/* Avatar - Always visible with Menu */}
          <Menu withinPortal position="bottom-end" offset={10} width={150} shadow="md">
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
              <Menu.Item 
                leftSection={<IconGavel size={16} />} 
                onClick={() => navigate('/my-bids')}
              >
                My Bids
              </Menu.Item>
              <Menu.Item 
                leftSection={<IconUser size={16} />} 
                onClick={() => navigate('/profile')}
              >
                Profile
              </Menu.Item>
              <Menu.Item 
                leftSection={<IconSettings size={16} />} 
                onClick={() => navigate('/settings')}
              >
                Settings
              </Menu.Item>
              <Divider />
              <Menu.Item 
                color="red" 
                leftSection={<IconLogout size={16} />} 
                onClick={doLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShell.Header>
  );
}

