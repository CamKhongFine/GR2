import { useEffect, useState } from 'react';
import {
  Container,
  Group,
  Button,
  Text,
  Burger,
  Drawer,
  Stack,
  Box,
  ActionIcon,
  Menu,
  Avatar,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import {
  IconBrandGithub,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconMail,
  IconUser,
  IconLogout,
  IconSettings,
} from '@tabler/icons-react';

interface User {
  name: string;
  email?: string;
}

export function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userInfoRaw = localStorage.getItem('user_info');
    if (token && userInfoRaw) {
      try {
        const userInfo = JSON.parse(userInfoRaw);
        setIsLoggedIn(true);
        setUser({ name: userInfo.username || 'User', email: userInfo.email });
      } catch {
        // ignore parse errors
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <Container fluid px={{ base: 'md', sm: 'lg' }}>
        <Group justify="space-between" h={70}>
          {/* Empty space for logo - có thể thêm logo sau */}
          <Box />

          {/* User Menu */}
          <Group gap="md" visibleFrom="sm">
            {isLoggedIn ? (
              <Menu shadow="md" width={220} zIndex={1001} offset={15}>
                <Menu.Target>
                  <Avatar 
                    size="md" 
                    color="blue" 
                    style={{ 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Account</Menu.Label>
                  <Menu.Item leftSection={<IconUser size={14} />}>
                    Profile
                  </Menu.Item>
                  <Menu.Item leftSection={<IconSettings size={14} />}>
                    Settings
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item 
                    leftSection={<IconLogout size={14} />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button 
                variant="outline" 
                size="md"
                leftSection={<IconUser size={18} />}
                style={{
                  padding: '10px 20px',
                  fontWeight: 600,
                  borderWidth: '2px',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </Button>
            )}
          </Group>

          {/* Mobile Menu Button */}
          <Burger
            opened={opened}
            onClick={toggle}
            size="sm"
            hiddenFrom="sm"
          />
        </Group>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <Stack gap="lg" mt="xl">
          {isLoggedIn ? (
            <>
              <Group gap="md" p="md" style={{ 
                backgroundColor: 'var(--mantine-color-gray-0)', 
                borderRadius: '20px',
                border: '3px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.2)'
              }}>
                <Avatar size="lg" color="blue" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Text fw={600} size="lg" c="blue">{user?.name || 'User'}</Text>
              </Group>
              
              <Button variant="outline" fullWidth leftSection={<IconUser size={16} />}>
                Profile
              </Button>
              <Button variant="outline" fullWidth leftSection={<IconSettings size={16} />}>
                Settings
              </Button>
              <Button 
                variant="outline" 
                fullWidth 
                leftSection={<IconLogout size={16} />}
                onClick={() => { handleLogout(); close(); }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              fullWidth
              size="lg"
              leftSection={<IconUser size={18} />}
              style={{
                fontWeight: 600,
                borderWidth: '2px',
                padding: '12px 20px',
              }}
              onClick={() => { navigate('/login'); close(); }}
            >
              Đăng nhập
            </Button>
          )}

          <Group justify="center" mt="xl">
            <ActionIcon variant="subtle" size="lg">
              <IconBrandGithub size={20} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="lg">
              <IconBrandTwitter size={20} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="lg">
              <IconBrandLinkedin size={20} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="lg">
              <IconMail size={20} />
            </ActionIcon>
          </Group>
        </Stack>
      </Drawer>
    </Box>
  );
}
