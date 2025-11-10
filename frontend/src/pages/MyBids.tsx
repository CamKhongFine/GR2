import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Tabs,
  Grid,
  Card,
  Image,
  Group,
  Text,
  Button,
  Stack,
  Table,
} from '@mantine/core';

type ActiveBidItem = {
  id: number;
  title: string;
  thumbnail: string;
  currentPrice: number;
  endsAt: number;
  heat: number;
};

type HistoryBidItem = {
  id: number;
  title: string;
  finalPrice: number;
  result: 'Won' | 'Lost';
  endedAt: number;
};

function formatTimeLeft(endsAt: number, now: number): string {
  const diff = Math.max(0, endsAt - now);
  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const sss = String(ss).padStart(2, '0');
  return `${hh}:${mm}:${sss}`;
}

const mockActive: ActiveBidItem[] = [
  { id: 101, title: 'Limited Edition Headphones', thumbnail: 'https://images.unsplash.com/photo-1518443952240-695c1f3f0f58?q=80&w=1200&auto=format&fit=crop', currentPrice: 149, endsAt: Date.now() + 1000 * 60 * 45, heat: 5 },
  { id: 102, title: 'Retro Console', thumbnail: 'https://images.unsplash.com/photo-1592841200221-81a9fae3b9bb?q=80&w=1200&auto=format&fit=crop', currentPrice: 320, endsAt: Date.now() + 1000 * 60 * 10, heat: 8 },
  { id: 103, title: 'Designer Sunglasses', thumbnail: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop', currentPrice: 95, endsAt: Date.now() + 1000 * 60 * 5, heat: 2 },
];

const mockHistory: HistoryBidItem[] = [
  { id: 201, title: 'Vintage Vinyl', finalPrice: 72, result: 'Won', endedAt: Date.now() - 1000 * 60 * 60 * 24 * 2 },
  { id: 202, title: 'Art Poster', finalPrice: 130, result: 'Lost', endedAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
  { id: 203, title: 'Collectible Figure', finalPrice: 260, result: 'Won', endedAt: Date.now() - 1000 * 60 * 60 * 24 * 12 },
];

export default function MyBids() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<string | null>('active');
  const [items, setItems] = useState<ActiveBidItem[]>(mockActive);
  const tickRef = useRef<number | null>(null);
  const priceRef = useRef<number | null>(null);
  const [, setTick] = useState(0);

  // countdown re-render each second and mock small price bumps (optional realism)
  useEffect(() => {
    tickRef.current = window.setInterval(() => setTick((v) => v + 1), 1000);
    priceRef.current = window.setInterval(() => {
      setItems((prev) => {
        if (prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        const delta = Math.random() < 0.5 ? 1 : 5;
        return prev.map((it, i) => (i === idx ? { ...it, currentPrice: it.currentPrice + delta, heat: it.heat + 1 } : it));
      });
    }, 5000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (priceRef.current) window.clearInterval(priceRef.current);
    };
  }, []);

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">My Bids</Title>
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="active">Active</Tabs.Tab>
          <Tabs.Tab value="history">History</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active" pt="md">
          <Grid gutter="lg">
            {items.map((item) => (
              <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="md" radius="md" withBorder>
                  <Card.Section>
                    <Image src={item.thumbnail} alt={item.title} h={160} fit="cover" loading="lazy" />
                  </Card.Section>
                  <Stack gap="xs" mt="sm">
                    <Title order={4} style={{ lineHeight: 1.2 }}>{item.title}</Title>
                    <Group justify="space-between">
                      <Text c="dimmed">Current price</Text>
                      <Text fw={700}>${item.currentPrice.toFixed(0)}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text c="dimmed">Ends in</Text>
                      <Text fw={600}>{formatTimeLeft(item.endsAt, Date.now())}</Text>
                    </Group>
                    <Button color="orange" radius="xl" mt="xs" onClick={() => navigate(`/auction/${item.id}`)}>
                      Go to auction
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <Table horizontalSpacing="md" verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item name</Table.Th>
                <Table.Th>Final price</Table.Th>
                <Table.Th>Result</Table.Th>
                <Table.Th>Ended at</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mockHistory.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td>{row.title}</Table.Td>
                  <Table.Td>${row.finalPrice.toFixed(0)}</Table.Td>
                  <Table.Td>
                    <Text c={row.result === 'Won' ? 'green' : 'red'} fw={600}>{row.result}</Text>
                  </Table.Td>
                  <Table.Td>{new Date(row.endedAt).toLocaleString()}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
