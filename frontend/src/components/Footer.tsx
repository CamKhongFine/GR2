import {
  Container,
  Grid,
  Stack,
  Text,
  Title,
  Group,
  ActionIcon,
  Box,
  Anchor,
} from '@mantine/core';
import {
  IconBrandGithub,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconMail,
  IconPhone,
  IconMapPin,
} from '@tabler/icons-react';

export function Footer() {
  return (
    <Box bg="dark" py={60} id="contact">
      <Container fluid px={{ base: 'md', sm: 'lg' }}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Title order={3} c="white">
                ProjectName
              </Title>
              <Text c="dimmed" size="sm">
                Một ứng dụng web hiện đại được xây dựng với React, TypeScript và Mantine UI.
                Tạo ra những trải nghiệm tuyệt vời cho người dùng.
              </Text>
              <Group gap="md" mt="md">
                <ActionIcon variant="subtle" color="gray" size="lg">
                  <IconBrandGithub size={20} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="gray" size="lg">
                  <IconBrandTwitter size={20} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="gray" size="lg">
                  <IconBrandLinkedin size={20} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="gray" size="lg">
                  <IconMail size={20} />
                </ActionIcon>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 2 }}>
            <Stack gap="md">
              <Title order={4} c="white">Sản phẩm</Title>
              <Stack gap="xs">
                <Anchor c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                  Tính năng
                </Anchor>
                <Anchor c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                  Giá cả
                </Anchor>
                <Anchor c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                  API
                </Anchor>
                <Anchor c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                  Tài liệu
                </Anchor>
              </Stack>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 2 }}>
            <Stack gap="md">
              <Title order={4} c="white">Hỗ trợ</Title>
              <Stack gap="xs">
                <Anchor c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                  Trung tâm trợ giúp
                </Anchor>
                <Anchor c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                  Liên hệ
                </Anchor>
                <Anchor c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                  Trạng thái
                </Anchor>
                <Anchor c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                  Cộng đồng
                </Anchor>
              </Stack>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Title order={4} c="white">Liên hệ</Title>
              <Stack gap="xs">
                <Group gap="xs">
                  <IconMail size={16} color="gray" />
                  <Text c="dimmed" size="sm">contact@projectname.com</Text>
                </Group>
                <Group gap="xs">
                  <IconPhone size={16} color="gray" />
                  <Text c="dimmed" size="sm">+84 123 456 789</Text>
                </Group>
                <Group gap="xs">
                  <IconMapPin size={16} color="gray" />
                  <Text c="dimmed" size="sm">Hà Nội, Việt Nam</Text>
                </Group>
              </Stack>
            </Stack>
          </Grid.Col>
        </Grid>

        <Box mt="xl" pt="xl" style={{ borderTop: '1px solid #333' }}>
          <Group justify="space-between" align="center">
            <Text c="dimmed" size="sm">
              © 2024 ProjectName. Tất cả quyền được bảo lưu.
            </Text>
            <Group gap="md">
              <Anchor c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                Điều khoản sử dụng
              </Anchor>
              <Anchor c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                Chính sách bảo mật
              </Anchor>
            </Group>
          </Group>
        </Box>
      </Container>
    </Box>
  );
}
