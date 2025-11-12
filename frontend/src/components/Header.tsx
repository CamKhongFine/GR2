import { useState } from 'react';
import { Container, Group, Anchor, Button, Avatar, ActionIcon, TextInput, Burger, Drawer, Stack, Title, rem, Box, Menu, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { IconBell, IconSearch, IconUser, IconSettings, IconLogout, IconGavel } from '@tabler/icons-react';


export default function HeaderBar() {
  const navigate = useNavigate();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('access_token'));
  const [userInfo, setUserInfo] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('user_info') || 'null'); } catch { return null; }
  });

  const doLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
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

  return (
    <Box component="header" style={{ height: 64 }}>
      <Container size="lg" h="100%">
        <Group justify="space-between" h="100%">
          <Group gap="xs">
            <Title order={3} style={{ fontSize: 24, fontWeight: 900, letterSpacing: 0.1 }}>Auction</Title>
          </Group>

          <Group gap="lg" visibleFrom="md">
            {navLinks.map((l) => (
              <Anchor key={l.href} component={Link} to={l.href} underline="never" c="dimmed">{l.label}</Anchor>
            ))}
          </Group>

          <Group gap="xs" visibleFrom="sm">
            <TextInput leftSection={<IconSearch size={16} />} placeholder="Search" aria-label="Search" radius="md" />
            {isLoggedIn ? (
              <Group gap="xs">
                <ActionIcon variant="subtle" aria-label="Notifications">
                  <IconBell size={18} />
                </ActionIcon>
                <Menu withinPortal position="bottom-end" offset={10} width={150} shadow="md">
                  <Menu.Target>
                    <Avatar radius="xl" color="blue" style={{ cursor: 'pointer' }} title={userInfo?.username || 'User'}>
                      {(userInfo?.username?.[0] || 'U').toUpperCase()}
                    </Avatar>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>{userInfo?.username || 'User'}</Menu.Label>
                    <Menu.Item leftSection={<IconGavel size={16} />} onClick={() => navigate('/my-bids')}>My Bids</Menu.Item>
                    <Menu.Item leftSection={<IconUser size={16} />} onClick={() => navigate('/profile')}>Profile</Menu.Item>
                    <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => navigate('/settings')}>Settings</Menu.Item>
                    <Divider />
                    <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={doLogout}>Logout</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            ) : (
              <Group gap="xs">
                <Button variant="subtle" component="a" href="/login">Login</Button>
                <Button component="a" href="/signup">Signup</Button>
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
                    <Menu.Item leftSection={<IconGavel size={16} />} onClick={() => { close(); navigate('/my-bids'); }}>My Bids</Menu.Item>
                    <Menu.Item leftSection={<IconUser size={16} />} onClick={() => { close(); navigate('/profile'); }}>Profile</Menu.Item>
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
