import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Paper, TextInput, PasswordInput, Button, Title, Text, Container, Box, Anchor } from '@mantine/core';
import { notifications } from '@mantine/notifications';

async function signupBackend(username: string, password: string, email?: string) {
  const response = await fetch("http://localhost:8000/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      email: email || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create account");
  }

  return await response.json();
}

export function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      notifications.show({
        title: 'Validation Error',
        message: 'Passwords do not match',
        color: 'red',
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      notifications.show({
        title: 'Validation Error',
        message: 'Password must be at least 6 characters',
        color: 'red',
      });
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create user in Keycloak via backend
      await signupBackend(username, password, email || undefined);
      
      notifications.show({
        title: 'Success',
        message: 'Account created',
        color: 'green',
      });
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'An error occurred during signup. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-dark-7) 100%)',
        padding: 'var(--mantine-spacing-md)',
      }}
    >
      <Container size={420}>
        <Paper shadow="md" radius="md" p="xl" style={{ backgroundColor: 'white' }}>
          <Title order={2} ta="center" mb="md">
            Sign up
          </Title>
          <Text c="dimmed" size="sm" ta="center" mb="xl">
            Create a new account to access the auction platform
          </Text>

          <form onSubmit={handleSubmit}>
            <TextInput
              label="Username"
              placeholder="Choose a username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              mb="md"
              disabled={loading}
            />

            <TextInput
              label="Email"
              placeholder="Enter your email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              mb="md"
              disabled={loading}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              mb="md"
              disabled={loading}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              mb="xl"
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="md"
            >
              Sign up
            </Button>

            <Text ta="center" mt="md" size="sm">
              Already have an account?{' '}
              <Anchor component={Link} to="/login">
                Sign in
              </Anchor>
            </Text>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

