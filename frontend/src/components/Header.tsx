import { useState } from 'react';
import {
  Container,
  Group,
  Anchor,
  Button,
  Avatar,
  ActionIcon,
  TextInput,
  Burger,
  Drawer,
  Stack,
  rem,
  Box,
  Menu,
  Divider,
  Image,
  UnstyledButton,
  Paper,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { IconBell, IconSearch, IconUser, IconSettings, IconLogout, IconGavel } from '@tabler/icons-react';
import Logo from '../assets/images/Logo.png';
import { clearAuthTokens } from '../utils/token';


export default function HeaderBar() {
  const navigate = useNavigate();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('access_token'));
  const [userInfo, setUserInfo] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('user_info') || 'null'); } catch { return null; }
  });
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const location = useLocation();

  const doLogout = () => {
    clearAuthTokens();
    setIsLoggedIn(false);
    setUserInfo(null);
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Browse Auctions', href: '/browse' },
    { label: 'Seller', href: '/seller/auctions' },
    { label: 'Contact', href: '/contact' },
  ];

  const renderNavLink = (link: typeof navLinks[number]) => {
    const isActive = location.pathname === link.href;
    const isHovered = hoveredNav === link.href;
    return (
      <Anchor
        key={link.href}
        component={Link}
        to={link.href}
        underline="never"
        fw={500}
        style={{
          position: 'relative',
          padding: '4px 0',
          transition: 'color 150ms ease',
          color: isActive || isHovered ? '#FF7A00' : '#4B5563',
        }}
        onMouseEnter={() => setHoveredNav(link.href)}
        onMouseLeave={() => setHoveredNav(null)}
      >
        {link.label}
      </Anchor>
    );
  };

  return (
    <Box
      component="header"
      style={{
        height: 72,
        backgroundColor: '#e9e8eb',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Container size="lg" h="100%">
        <Group justify="space-between" align="center" h="100%">
          <UnstyledButton onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Group gap="xs">
              <Image src={Logo} alt="Smart Auction" h={30} fit="contain" />
            </Group>
          </UnstyledButton>

          <Group gap="lg" visibleFrom="md" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
            {navLinks.map(renderNavLink)}
          </Group>

          <Group gap="md" visibleFrom="sm" align="center">
            <Paper
              radius="xl"
              withBorder={false}
              shadow="xs"
              px="md"
              py={6}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: '#F9FAFB',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                minWidth: 260,
              }}
            >
              <TextInput
                placeholder="Search auctions"
                aria-label="Search auctions"
                variant="unstyled"
                style={{ flex: 1, fontFamily: 'Inter, sans-serif' }}
              />
              <ActionIcon
                size="lg"
                radius="xl"
                color="orange"
                variant="filled"
                aria-label="Search"
              >
                <IconSearch size={16} />
              </ActionIcon>
            </Paper>

            {isLoggedIn ? (
              <Group gap="sm" align="center">
                <ActionIcon
                  variant="subtle"
                  aria-label="Notifications"
                  color="gray"
                  radius="xl"
                  size="lg"
                >
                  <IconBell size={18} />
                </ActionIcon>
                <Menu withinPortal position="bottom-end" offset={{ mainAxis: 10, crossAxis: 145 }} width={180} shadow="md">
                  <Menu.Target>
                    <Avatar radius="xl" color="blue" style={{ cursor: 'pointer' }} title={userInfo?.username || 'User'}>
                      {(userInfo?.username?.[0] || 'U').toUpperCase()}
                    </Avatar>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>{userInfo?.username || 'User'}</Menu.Label>
                    <Menu.Item leftSection={<IconUser size={16} />} onClick={() => navigate('/profile')}>Profile</Menu.Item>
                    <Menu.Item leftSection={<IconGavel size={16} />} onClick={() => navigate('/my-bids')}>My Bids</Menu.Item>
                    <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => navigate('/settings')}>Settings</Menu.Item>
                    <Divider />
                    <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={doLogout}>Logout</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            ) : (
              <Group gap="sm">
                <Button variant="subtle" color="gray" component="a" href="/login">Login</Button>
                <Button component="a" href="/signup" color="orange">Signup</Button>
              </Group>
            )}
          </Group>

          <Group hiddenFrom="md">
            <ActionIcon variant="subtle" aria-label="Search"><IconSearch size={18} /></ActionIcon>
            <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" size="sm" />
          </Group>
        </Group>
      </Container>

      <Drawer opened={opened} onClose={close} padding="md" size={rem(320)} title="Menu">
        <Stack gap="md">
          {navLinks.map((l) => (
            <Anchor key={l.href} component={Link} to={l.href} onClick={close}>{l.label}</Anchor>
          ))}
          <TextInput leftSection={<IconSearch size={16} />} placeholder="Search" aria-label="Search" radius="md" />
          {isLoggedIn ? (
            <Stack>
              <Group>
                <ActionIcon variant="subtle" aria-label="Notifications"><IconBell size={18} /></ActionIcon>
                <Menu withinPortal position="bottom-end" offset={16} width={260} shadow="md">
                  <Menu.Target>
                    <Avatar radius="xl" color="blue" style={{ cursor: 'pointer' }} title={userInfo?.username || 'User'}>
                      {(userInfo?.username?.[0] || 'U').toUpperCase()}
                    </Avatar>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>{userInfo?.username || 'User'}</Menu.Label>
                    <Menu.Item leftSection={<IconUser size={16} />} onClick={() => { close(); navigate('/profile'); }}>Profile</Menu.Item>
                    <Menu.Item leftSection={<IconGavel size={16} />} onClick={() => { close(); navigate('/my-bids'); }}>My Bids</Menu.Item>
                    <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => { close(); navigate('/settings'); }}>Settings</Menu.Item>
                    <Divider />
                    <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={() => { close(); doLogout(); }}>Logout</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Stack>
          ) : (
            <Group>
              <Button variant="subtle" component="a" href="/login" onClick={close}>Login</Button>
              <Button component="a" href="/signup" onClick={close}>Signup</Button>
            </Group>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
}
