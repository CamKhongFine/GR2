import { memo, useState } from 'react';
import type { MouseEvent } from 'react';
import { Card, CardSection, Image, Group, Text, Button, Stack, ActionIcon, Tooltip } from '@mantine/core';
import { IconHeart, IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export type AuctionCardProps = {
  id: number;
  title: string;
  thumbnail: string;
  currentPrice: number;
  timeLeftLabel: string;
  onBid: (id: number) => void;
};

function AuctionCardBase({ id, title, thumbnail, currentPrice, timeLeftLabel, onBid }: AuctionCardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const handleNavigate = () => navigate(`/auction/${id}`);
  const handleBidClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onBid(id);
  };
  return (
    <Card
      shadow={hovered ? 'lg' : 'md'}
      radius={12}
      withBorder={false}
      style={{
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundColor: '#ffffff',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        transform: hovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 18px 36px rgba(255, 122, 0, 0.12)'
          : '0 10px 24px rgba(15, 23, 42, 0.08)',
      }}
      onClick={handleNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Open details for ${title}`}
    >
      <CardSection>
        <Image src={thumbnail} alt={title} h={190} fit="cover" loading="lazy" />
      </CardSection>
      <Stack gap="sm" mt="md">
        <Group justify="space-between" align="flex-start">
          <Text fw={700} style={{ lineHeight: 1.25, fontFamily: 'Inter, Poppins, sans-serif' }}>{title}</Text>
          <Group gap={4} wrap="nowrap">
            <Tooltip label="Quick view" withArrow>
              <ActionIcon variant="light" aria-label="Quick view" color="gray">
                <IconEye size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Add to wishlist" withArrow>
              <ActionIcon variant="light" aria-label="Add to wishlist" color="gray">
                <IconHeart size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <Group justify="space-between" style={{ fontFamily: 'Inter, sans-serif' }}>
          <Text c="dimmed" size="sm">Current price</Text>
          <Text fw={700} size="lg" c="#0F172A">${currentPrice.toFixed(0)}</Text>
        </Group>
        <Group justify="space-between" style={{ fontFamily: 'Inter, sans-serif' }}>
          <Text c="dimmed" size="sm">Ends in</Text>
          <Text fw={600} size="sm" c="#FF7A00">{timeLeftLabel}</Text>
        </Group>
        <Button
          mt="sm"
          color="orange"
          radius="xl"
          size="md"
          fullWidth
          onClick={handleBidClick}
          aria-label={`Bid now on ${title}`}
          style={{ fontWeight: 600, letterSpacing: 0.2 }}
        >
          Bid now
        </Button>
      </Stack>
    </Card>
  );
}

const AuctionCard = memo(AuctionCardBase);
export default AuctionCard;
