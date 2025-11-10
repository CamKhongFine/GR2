import { Container, Group, Text, Anchor, ActionIcon, Box } from '@mantine/core';
import { IconBrandGithub, IconBrandTwitter, IconBrandFacebook } from '@tabler/icons-react';

export default function AppFooter() {
  return (
    <Box component="footer" style={{ height: 64, boxShadow: '0 -6px 24px rgba(0,0,0,0.06)' }}>
      <Container size="lg" h="100%">
        <Group justify="space-between" h="100%">
          <Text size="sm" c="dimmed">© {new Date().getFullYear()} Auction Platform</Text>
          <Group gap="md">
            <Anchor href="#" c="dimmed" size="sm">Privacy</Anchor>
            <Anchor href="#" c="dimmed" size="sm">Terms</Anchor>
            <Anchor href="#" c="dimmed" size="sm">Contact</Anchor>
            <ActionIcon variant="subtle" aria-label="Github"><IconBrandGithub size={18} /></ActionIcon>
            <ActionIcon variant="subtle" aria-label="Twitter"><IconBrandTwitter size={18} /></ActionIcon>
            <ActionIcon variant="subtle" aria-label="Facebook"><IconBrandFacebook size={18} /></ActionIcon>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
