import { Container, Group, Text, Anchor, ActionIcon, Box, Stack } from '@mantine/core';
import { IconBrandGithub, IconBrandTwitter, IconBrandFacebook } from '@tabler/icons-react';

export default function AppFooter() {
  const footerLinks = [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Contact', href: '#' },
  ];

  return (
    <Box
      component="footer"
      style={{
        padding: '24px 0',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      <Container size="lg">
        <Stack gap="sm" align="center">
          <Group gap="lg">
            {footerLinks.map((link) => (
              <Anchor
                key={link.label}
                href={link.href}
                size="sm"
                styles={{
                  root: {
                    color: '#9CA3AF',
                    transition: 'color 150ms ease, text-decoration 150ms ease',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#FF7A00',
                      textDecoration: 'underline',
                    },
                  },
                }}
              >
                {link.label}
              </Anchor>
            ))}
          </Group>

          <Group gap="sm">
            <ActionIcon variant="subtle" color="gray" aria-label="Github"><IconBrandGithub size={18} /></ActionIcon>
            <ActionIcon variant="subtle" color="gray" aria-label="Twitter"><IconBrandTwitter size={18} /></ActionIcon>
            <ActionIcon variant="subtle" color="gray" aria-label="Facebook"><IconBrandFacebook size={18} /></ActionIcon>
          </Group>

          <Text size="sm" style={{ color: '#9CA3AF', fontWeight: 500 }}>
            © {new Date().getFullYear()} Auction Platform. All rights reserved.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
