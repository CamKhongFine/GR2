import {
  Container,
  Group,
  Button,
  Text,
  Burger,
  Drawer,
  Stack,
  Anchor,
  Box,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBrandGithub,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconMail,
} from '@tabler/icons-react';

export function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false);

  const navItems = [
    { label: 'Trang chủ', href: '#home' },
    { label: 'Tính năng', href: '#features' },
    { label: 'Giá cả', href: '#pricing' },
    { label: 'Liên hệ', href: '#contact' },
  ];

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
          {/* Logo */}
          <Text
            size="xl"
            fw={900}
            variant="gradient"
            gradient={{ from: 'blue', to: 'purple' }}
          >
            ProjectName
          </Text>

          {/* Desktop Navigation */}
          <Group gap="xl" visibleFrom="sm">
            {navItems.map((item) => (
              <Anchor
                key={item.label}
                href={item.href}
                c="dark"
                fw={500}
                style={{ textDecoration: 'none' }}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector(item.href);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {item.label}
              </Anchor>
            ))}
          </Group>

          {/* Desktop CTA Buttons */}
          <Group gap="md" visibleFrom="sm">
            <Button variant="outline" size="sm">
              Đăng nhập
            </Button>
            <Button size="sm">
              Bắt đầu
            </Button>
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
          {navItems.map((item) => (
            <Anchor
              key={item.label}
              href={item.href}
              c="dark"
              fw={500}
              size="lg"
              style={{ textDecoration: 'none' }}
              onClick={(e) => {
                e.preventDefault();
                const element = document.querySelector(item.href);
                element?.scrollIntoView({ behavior: 'smooth' });
                close();
              }}
            >
              {item.label}
            </Anchor>
          ))}
          
          <Group gap="md" mt="xl">
            <Button variant="outline" fullWidth>
              Đăng nhập
            </Button>
            <Button fullWidth>
              Bắt đầu
            </Button>
          </Group>

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
