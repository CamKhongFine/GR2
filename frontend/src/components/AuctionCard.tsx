import { memo } from 'react';
import { Card, CardSection, Image, Group, Text, Button, Stack, ActionIcon, Tooltip } from '@mantine/core';
import { IconHeart, IconEye } from '@tabler/icons-react';

export type AuctionCardProps = {
  id: number;
  title: string;
  thumbnail: string;
  currentPrice: number;
  timeLeftLabel: string;
  onBid: (id: number) => void;
};

function AuctionCardBase({ id, title, thumbnail, currentPrice, timeLeftLabel, onBid }: AuctionCardProps) {
  return (
    <Card shadow="md" radius="md" withBorder style={{ overflow: 'hidden' }}>
      <CardSection>
        <Image src={thumbnail} alt={title} h={170} fit="cover" loading="lazy" />
      </CardSection>
      <Stack gap="xs" mt="sm">
        <Group justify="space-between" align="flex-start">
          <Text fw={700} style={{ lineHeight: 1.2 }}>{title}</Text>
          <Group gap={4}>
            <Tooltip label="Quick view" withArrow>
              <ActionIcon variant="subtle" aria-label="Quick view"><IconEye size={16} /></ActionIcon>
            </Tooltip>
            <Tooltip label="Add to wishlist" withArrow>
              <ActionIcon variant="subtle" aria-label="Add to wishlist"><IconHeart size={16} /></ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <Group justify="space-between">
          <Text c="dimmed">Current price</Text>
          <Text fw={700}>${currentPrice.toFixed(0)}</Text>
        </Group>
        <Group justify="space-between">
          <Text c="dimmed">Ends in</Text>
          <Text fw={600}>{timeLeftLabel}</Text>
        </Group>
        <Button mt="xs" color="orange" radius="xl" onClick={() => onBid(id)} aria-label={`Bid now on ${title}`}>
          Bid now
        </Button>
      </Stack>
    </Card>
  );
}

const AuctionCard = memo(AuctionCardBase);
export default AuctionCard;
