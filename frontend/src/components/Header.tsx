import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Box,
  Center,
  SimpleGrid,
  Card,
  ThemeIcon,
  Badge,
} from '@mantine/core';
import {
  IconRocket,
  IconShield,
  IconHeart,
  IconArrowRight,
  IconCheck,
  IconStar,
} from '@tabler/icons-react';

export function Header() {
  return (
    <Box id="home">
      {/* Hero Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '70px', // Account for fixed navbar
        }}
      >
        <Container fluid px={{ base: 'md', sm: 'lg' }}>
          <Center>
            <Stack align="center" gap="xl" maw={800}>
              <Badge size="lg" variant="light" color="white" mb="md">
                🚀 Phiên bản mới nhất
              </Badge>
              
              <Title
                order={1}
                size="3rem"
                fw={900}
                ta="center"
                c="white"
                style={{ 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontSize: 'clamp(2rem, 5vw, 4rem)'
                }}
              >
                Tạo ứng dụng web{' '}
                <Text
                  component="span"
                  inherit
                  variant="gradient"
                  gradient={{ from: '#ffd700', to: '#ffed4e' }}
                >
                  tuyệt vời
                </Text>{' '}
                với Mantine UI
              </Title>
              
              <Text 
                size="xl" 
                c="white" 
                ta="center" 
                maw={600}
                style={{ 
                  opacity: 0.9,
                  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
                }}
              >
                Một ứng dụng web hiện đại được xây dựng với React, TypeScript và Mantine UI.
                Khám phá các tính năng tuyệt vời và trải nghiệm người dùng mượt mà.
              </Text>

              <Group gap="md" justify="center">
                <Button
                  size="lg"
                  rightSection={<IconArrowRight size={20} />}
                  variant="white"
                  color="dark"
                >
                  Bắt đầu miễn phí
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  color="white"
                >
                  Xem demo
                </Button>
              </Group>

              {/* Trust indicators */}
              <Group gap="xl" mt="xl" c="white" style={{ opacity: 0.8 }}>
                <Group gap="xs">
                  <IconStar size={16} fill="currentColor" />
                  <Text size="sm">4.9/5 đánh giá</Text>
                </Group>
                <Group gap="xs">
                  <IconCheck size={16} />
                  <Text size="sm">10,000+ người dùng</Text>
                </Group>
                <Group gap="xs">
                  <IconCheck size={16} />
                  <Text size="sm">Miễn phí mãi mãi</Text>
                </Group>
              </Group>
            </Stack>
          </Center>
        </Container>
      </Box>

      {/* Features Preview */}
      <Container fluid py={80} px={{ base: 'md', sm: 'lg' }} id="features">
        <Stack align="center" gap="xl">
          <Title 
            order={2} 
            size="3rem" 
            ta="center"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            Tại sao chọn chúng tôi?
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Khám phá những tính năng mạnh mẽ giúp bạn tạo ra những ứng dụng tuyệt vời
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt="xl">
            <Card shadow="md" padding="xl" radius="md" withBorder h="100%">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                  <IconRocket size={30} />
                </ThemeIcon>
                <Title order={3} ta="center">Hiệu suất cao</Title>
                <Text ta="center" c="dimmed">
                  Được tối ưu hóa để mang lại hiệu suất tốt nhất với React 19 và Vite
                </Text>
              </Stack>
            </Card>

            <Card shadow="md" padding="xl" radius="md" withBorder h="100%">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="md" variant="gradient" gradient={{ from: 'green', to: 'teal' }}>
                  <IconShield size={30} />
                </ThemeIcon>
                <Title order={3} ta="center">Bảo mật</Title>
                <Text ta="center" c="dimmed">
                  Tuân thủ các tiêu chuẩn bảo mật cao nhất với TypeScript và best practices
                </Text>
              </Stack>
            </Card>

            <Card shadow="md" padding="xl" radius="md" withBorder h="100%">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="md" variant="gradient" gradient={{ from: 'pink', to: 'red' }}>
                  <IconHeart size={30} />
                </ThemeIcon>
                <Title order={3} ta="center">Thân thiện</Title>
                <Text ta="center" c="dimmed">
                  Giao diện đẹp mắt và trải nghiệm người dùng tuyệt vời với Mantine UI
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
