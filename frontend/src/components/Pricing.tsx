import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Stack,
  Group,
  Box,
  Badge,
  SimpleGrid,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCheck,
  IconRocket,
} from '@tabler/icons-react';

export function Pricing() {
  const plans = [
    {
      name: 'Miễn phí',
      price: '0',
      period: '/tháng',
      description: 'Hoàn hảo cho dự án cá nhân',
      features: [
        'Tối đa 3 dự án',
        '5GB lưu trữ',
        'Hỗ trợ email',
        'Templates cơ bản',
        'API cơ bản',
      ],
      buttonText: 'Bắt đầu miễn phí',
      buttonVariant: 'outline' as const,
      popular: false,
    },
    {
      name: 'Pro',
      price: '29',
      period: '/tháng',
      description: 'Tốt nhất cho doanh nghiệp nhỏ',
      features: [
        'Dự án không giới hạn',
        '50GB lưu trữ',
        'Hỗ trợ ưu tiên',
        'Templates cao cấp',
        'API đầy đủ',
        'Tích hợp bên thứ 3',
        'Báo cáo chi tiết',
      ],
      buttonText: 'Nâng cấp Pro',
      buttonVariant: 'filled' as const,
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '99',
      period: '/tháng',
      description: 'Giải pháp cho doanh nghiệp lớn',
      features: [
        'Tất cả tính năng Pro',
        'Lưu trữ không giới hạn',
        'Hỗ trợ 24/7',
        'Tùy chỉnh hoàn toàn',
        'API không giới hạn',
        'SLA 99.9%',
        'Quản lý team',
        'Bảo mật nâng cao',
      ],
      buttonText: 'Liên hệ bán hàng',
      buttonVariant: 'outline' as const,
      popular: false,
    },
  ];

  return (
    <Box bg="gray.0" py={80} id="pricing">
      <Container fluid px={{ base: 'md', sm: 'lg' }}>
        <Stack align="center" gap="xl">
          <Title 
            order={2} 
            size="3rem" 
            ta="center"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            Chọn gói phù hợp
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Bắt đầu miễn phí và nâng cấp khi bạn cần thêm tính năng
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt="xl">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                shadow="md"
                padding="xl"
                radius="md"
                withBorder
                h="100%"
                style={{
                  position: 'relative',
                  border: plan.popular ? '2px solid #667eea' : undefined,
                }}
              >
                {plan.popular && (
                  <Badge
                    size="lg"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'purple' }}
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    Phổ biến nhất
                  </Badge>
                )}

                <Stack gap="md" align="center">
                  <Group gap="xs" align="baseline">
                    <Title order={2} size="3rem" c={plan.popular ? 'blue' : 'dark'}>
                      {plan.price}
                    </Title>
                    <Text c="dimmed" size="lg">
                      {plan.period}
                    </Text>
                  </Group>

                  <Title order={3} ta="center">
                    {plan.name}
                  </Title>

                  <Text ta="center" c="dimmed" size="sm">
                    {plan.description}
                  </Text>

                  <Stack gap="sm" w="100%" mt="md">
                    {plan.features.map((feature) => (
                      <Group key={feature} gap="sm">
                        <ThemeIcon size="sm" color="green" variant="light">
                          <IconCheck size={12} />
                        </ThemeIcon>
                        <Text size="sm">{feature}</Text>
                      </Group>
                    ))}
                  </Stack>

                  <Button
                    fullWidth
                    size="lg"
                    variant={plan.buttonVariant}
                    color={plan.popular ? 'blue' : undefined}
                    mt="auto"
                    rightSection={plan.popular ? <IconRocket size={16} /> : undefined}
                  >
                    {plan.buttonText}
                  </Button>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>

          <Text ta="center" c="dimmed" size="sm" mt="xl">
            Tất cả gói đều bao gồm hỗ trợ 30 ngày và không có phí setup
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
