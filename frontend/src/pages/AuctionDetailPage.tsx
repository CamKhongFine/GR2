import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Image,
  Group,
  Stack,
  Title,
  Text,
  Button,
  Badge,
  Modal,
  NumberInput,
  Table,
  Divider,
  Paper,
} from '@mantine/core';

type AuctionItem = {
  id: number;
  title: string;
  thumbnail: string;
  currentPrice: number;
  endsAt: number;
  createdAt: number;
  heat: number;
  gallery: string[];
};

const mockItems: AuctionItem[] = [
  {
    id: 1,
    title: 'Vintage Camera',
    thumbnail: 'https://images.esquiremag.ph/esquiremagph/images/2019/11/06/where-to-buy-vintage-camera-MAINIMAGE.jpg',
    currentPrice: 120,
    endsAt: Date.now() + 1000 * 60 * 25,
    createdAt: Date.now() - 1000 * 60 * 5,
    heat: 3,
    gallery: [
      'https://images.unsplash.com/photo-1519183071298-a2962be96f83?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552083375-1447ce886485?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    id: 2,
    title: 'Classic Watch',
    thumbnail: 'https://www.pierrecardinwatches.com/cdn/shop/files/CF.1005.MD_4.jpg?v=1731385232',
    currentPrice: 340,
    endsAt: Date.now() + 1000 * 60 * 42,
    createdAt: Date.now() - 1000 * 60 * 60,
    heat: 9,
    gallery: [
      'https://images.unsplash.com/photo-1513863323963-2f0b6cf3fab5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    id: 3,
    title: 'Sneakers Limited',
    thumbnail: 'https://i.shgcdn.com/4a179e4c-6e93-4af2-9ab0-58543f0d68c0/-/format/auto/-/preview/3000x3000/-/quality/lighter/',
    currentPrice: 220,
    endsAt: Date.now() + 1000 * 60 * 12,
    createdAt: Date.now() - 1000 * 60 * 2,
    heat: 7,
    gallery: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519741497675-2514df4fda83?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548865168-1a5c46ecf8d8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?q=80&w=1200&auto=format&fit=crop',
    ],
  },
];

function formatTimeLeft(endsAt: number): string {
  const diff = Math.max(0, endsAt - Date.now());
  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export default function AuctionDetailPage() {
  const { id } = useParams();
  const parsedId = Number(id);
  const item = useMemo(() => mockItems.find((x) => x.id === parsedId) || mockItems[0], [parsedId]);

  const [mainImg, setMainImg] = useState<string>(item.gallery[0]);
  const [timeLeft, setTimeLeft] = useState<string>(formatTimeLeft(item.endsAt));
  const [opened, setOpened] = useState<boolean>(false);
  const [bid, setBid] = useState<number | ''>('');
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    tickRef.current = window.setInterval(() => setTimeLeft(formatTimeLeft(item.endsAt)), 1000);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [item.endsAt]);

  const bidHistory = useMemo(() => {
    return [
      { id: 1, user: 'you', amount: item.currentPrice - 5, time: new Date(Date.now() - 1000 * 60 * 8).toLocaleString() },
      { id: 2, user: 'bidder_392', amount: item.currentPrice - 3, time: new Date(Date.now() - 1000 * 60 * 6).toLocaleString() },
      { id: 3, user: 'you', amount: item.currentPrice - 1, time: new Date(Date.now() - 1000 * 60 * 2).toLocaleString() },
    ];
  }, [item.currentPrice]);

  return (
    <Container size="lg" py="xl">
      {/* Title row */}
      <Group justify="space-between" mb="md">
        <Stack gap={4}>
          <Title order={2} style={{ lineHeight: 1.2 }}>{item.title}</Title>
          <Group gap="sm">
            <Badge variant="light" color="orange">#{item.id}</Badge>
            <Text c="dimmed">Heat: {item.heat}</Text>
          </Group>
        </Stack>
        <Stack gap={0} align="flex-end">
          <Text c="dimmed" size="sm">Time left</Text>
          <Title order={3}>{timeLeft}</Title>
        </Stack>
      </Group>

      <Paper withBorder radius="md" p="md">
        <Grid gutter="xl" align="flex-start">
          {/* Left column: main image & gallery */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Image src={mainImg} alt={item.title} radius="md" fit="contain" h={420} />
            <Group gap="sm" mt="md" wrap="nowrap">
              {item.gallery.slice(0, 5).map((src, idx) => (
                <Image
                  key={src + idx}
                  src={src}
                  alt={`thumb-${idx}`}
                  radius="sm"
                  h={72}
                  w={100}
                  fit="cover"
                  onClick={() => setMainImg(src)}
                  style={{ cursor: 'pointer', border: src === mainImg ? '2px solid var(--mantine-color-orange-6)' : '2px solid transparent' }}
                />
              ))}
            </Group>
          </Grid.Col>

          {/* Right column: pricing & CTA */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="sm">
              <Text c="dimmed">Current price</Text>
              <Title order={2} style={{ fontSize: 40, lineHeight: 1 }}>${item.currentPrice.toFixed(0)}</Title>
              <Group gap="xs">
                <Text c="dimmed">Ends in</Text>
                <Text fw={700}>{timeLeft}</Text>
              </Group>
              <Button color="orange" radius="xl" size="md" onClick={() => setOpened(true)}>
                Place bid
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Bid history */}
      <Title order={3} mt="xl" mb="sm">Bid History</Title>
      <Divider mb="md" />
      <Table horizontalSpacing="md" verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Bidder</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Time</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {bidHistory.map((b) => (
            <Table.Tr key={b.id}>
              <Table.Td>{b.user}</Table.Td>
              <Table.Td>${b.amount.toFixed(0)}</Table.Td>
              <Table.Td>{b.time}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Place bid modal */}
      <Modal opened={opened} onClose={() => setOpened(false)} title="Place your bid" centered>
        <Stack>
          <NumberInput
            label="Bid amount (USD)"
            placeholder={`${(item.currentPrice + 1).toFixed(0)}`}
            min={item.currentPrice + 1}
            value={bid}
            onChange={(val) => setBid(typeof val === 'number' ? val : '')}
            thousandSeparator
          />
          <Button color="orange" radius="xl" onClick={() => { console.log('bid sent: ', bid); setOpened(false); }}>
            Confirm
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
}
