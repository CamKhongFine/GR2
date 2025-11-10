import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, TextInput, PasswordInput, Button, Title, Text, Anchor, Group, Stack, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMail, IconLock, IconBrandGoogleFilled, IconBrandFacebook } from '@tabler/icons-react';

export function AuthenticationForm(props: any) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If you decide to switch back to username, map email -> username here
    login(email, password);
  };

  async function login(username: string, password: string) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('client_id', 'auction-web');
      params.append('grant_type', 'password');
      params.append('username', username);
      params.append('password', password);

      const resp = await fetch('http://localhost:8080/realms/auction/protocol/openid-connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const tok = await resp.json();
      if (!tok.access_token) {
        notifications.show({ color: 'red', title: 'Login failed', message: tok.error_description || 'Invalid credentials' });
        return;
      }
      localStorage.setItem('access_token', tok.access_token);

      const meResp = await fetch('http://localhost:8000/me', {
        headers: { Authorization: `Bearer ${tok.access_token}` },
      });
      if (!meResp.ok) throw new Error('Failed to get user info');
      const me = await meResp.json();
      localStorage.setItem('user_info', JSON.stringify(me));

      notifications.show({ color: 'green', title: 'Success', message: 'Login successfully' });
      navigate('/');
    } catch (e: any) {
      notifications.show({ color: 'red', title: 'Error', message: e?.message || 'Login error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper radius="md" p="xl" withBorder style={{ width: '430px', border: 'none', position: 'relative' }} {...props}>
      <Title order={2}>Welcome Back!</Title>
      <Text c="dimmed" size="sm" mt="xs">
        Start managing your finance faster and better
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack mt="md">
          <TextInput  
            placeholder="hello@mantine.dev"
            required
            leftSection={<IconMail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />  
          <PasswordInput
            placeholder="Your password"
            required
            leftSection={<IconLock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </Stack>

        <Group justify="flex-end" mt="lg">
          <Anchor onClick={(e) => { e.preventDefault(); console.log('Forgot password'); }} size="sm" fw={700}>
            Forgot password?
          </Anchor>
        </Group>

        <Button type="submit" size="md" fullWidth mt="xl" color="blue" loading={loading}>
          Login
        </Button>
      </form>

      <Divider label="Or" labelPosition="center" my="lg" />

      <Group grow>
        <Button variant="outline" leftSection={<IconBrandGoogleFilled size={18} />} onClick={() => console.log('Google')} disabled={loading}>
          Google
        </Button>
        <Button variant="outline" leftSection={<IconBrandFacebook size={18} />} onClick={() => console.log('Facebook')} disabled={loading}>
          Facebook
        </Button>
      </Group>

      <Text c="dimmed" size="sm" ta="center" mt="md">
        Don’t you have an account?{' '}
        <Anchor ml={5} onClick={(e) => { e.preventDefault(); if (!loading) navigate('/signup'); }} fw={700}>
          Sign Up
        </Anchor>
      </Text>
    </Paper>
  );
}
