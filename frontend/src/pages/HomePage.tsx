import { useEffect, useMemo, useRef, useState } from 'react';
import HeaderBar from '../components/Header';
import AppFooter from '../components/Footer';
import AuctionCard from '../components/AuctionCard';
import {
  AppShell,
  Container,
  Title,
  Text,
  Grid,
  Group,
  Badge,
  Stack,
  Tabs,
  Skeleton,
  Button,
  Divider,
} from '@mantine/core';

type AuctionItem = {
  id: number;
  title: string;
  thumbnail: string;
  currentPrice: number;
  endsAt: number;
  createdAt: number;
  heat: number;
};

const mockItemsSeed: AuctionItem[] = [
  { id: 1, title: 'Vintage Camera', thumbnail: 'https://images.esquiremag.ph/esquiremagph/images/2019/11/06/where-to-buy-vintage-camera-MAINIMAGE.jpg', currentPrice: 120, endsAt: Date.now() + 1000 * 60 * 25, createdAt: Date.now() - 1000 * 60 * 5, heat: 3 },
    { id: 2, title: 'Classic Watch', thumbnail: 'https://www.pierrecardinwatches.com/cdn/shop/files/CF.1005.MD_4.jpg?v=1731385232', currentPrice: 340, endsAt: Date.now() + 1000 * 60 * 42, createdAt: Date.now() - 1000 * 60 * 60, heat: 9 },
    { id: 3, title: 'Sneakers Limited', thumbnail: 'https://i.shgcdn.com/4a179e4c-6e93-4af2-9ab0-58543f0d68c0/-/format/auto/-/preview/3000x3000/-/quality/lighter/', currentPrice: 220, endsAt: Date.now() + 1000 * 60 * 12, createdAt: Date.now() - 1000 * 60 * 2, heat: 7 },
  { id: 4, title: 'Rare Trading Card', thumbnail: 'https://cdn.catawiki.net/assets/marketing/uploads-files/51621-85a01cc12270c23cfcf6ee9b97b551f246bca11b-story_inline_image.png', currentPrice: 85, endsAt: Date.now() + 1000 * 60 * 58, createdAt: Date.now() - 1000 * 60 * 180, heat: 4 },
  { id: 5, title: 'Designer Bag', thumbnail: 'https://img4.dhresource.com/webp/m/0x0/f3/albu/jc/y/03/349cc688-f592-4bf7-99e8-f5bac31746fa.jpg', currentPrice: 510, endsAt: Date.now() + 1000 * 60 * 33, createdAt: Date.now() - 1000 * 60 * 20, heat: 10 },
  { id: 6, title: 'Art Print #21', thumbnail: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop', currentPrice: 60, endsAt: Date.now() + 1000 * 60 * 7, createdAt: Date.now() - 1000 * 60 * 1, heat: 5 },
];

function formatTimeLeft(endsAt: number, now: number): string {
  const diff = Math.max(0, endsAt - now);
  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export default function HomePage() {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<string | null>('featured');
  const tickRef = useRef<number | null>(null);
  const priceRef = useRef<number | null>(null);
  const [tick, setTick] = useState(0);

  // Simulate fetching data
  useEffect(() => {
    const t = setTimeout(() => {
      setItems(mockItemsSeed);
      setLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  // Countdown and mock realtime bidding
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

  const filtered = useMemo(() => {
    if (tab === 'latest') return [...items].sort((a, b) => b.createdAt - a.createdAt);
    if (tab === 'ending') return [...items].sort((a, b) => a.endsAt - b.endsAt);
    if (tab === 'hot') return [...items].sort((a, b) => b.heat - a.heat);
    return items;
  }, [items, tab]);

  return (
    <AppShell header={{ height: 64 }} footer={{ height: 64 }} padding="md">
      <AppShell.Header>
        <HeaderBar />
      </AppShell.Header>
      <AppShell.Main>
        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
            color: 'white',
            padding: '64px 0',
            marginBottom: 24,
          }}
        >
          <Container size="lg">
            <Stack gap="xs">
              <Title order={1} style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, lineHeight: 1.1 }}>
                Săn Lùng Món Hàng Độc Nhất
              </Title>
              <Text size="lg" style={{ opacity: 0.9 }}>
                Đấu giá ngay, rinh quà liền tay. Nền tảng đấu giá thời gian thực cho mọi người.
              </Text>
              <Group mt="sm">
                <Button component="a" href="#auctions" variant="white" color="dark">Xem các sản phẩm đang đấu giá</Button>
                <Button variant="outline" color="white">Tìm hiểu thêm</Button>
              </Group>
            </Stack>
          </Container>
        </div>

        <Divider mb="xl" color="black" opacity={0.1} />

        <Container size="lg" id="auctions">
          <Group justify="space-between" mb="md">
            <Title order={2}>Sản Phẩm Đang Đấu Giá</Title>
            <Badge variant="light" size="lg" color="blue">{items.length} items</Badge>
          </Group>

          {/* Filters / Tabs */}
          <Tabs value={tab} onChange={setTab} mb="md">
            <Tabs.List>
              <Tabs.Tab value="featured">Nổi bật</Tabs.Tab>
              <Tabs.Tab value="latest">Mới nhất</Tabs.Tab>
              <Tabs.Tab value="ending">Sắp kết thúc</Tabs.Tab>
              <Tabs.Tab value="hot">Hot nhất</Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {/* Loading state */}
          {loading ? (
            <Grid gutter="lg">
              {Array.from({ length: 8 }).map((_, i) => (
                <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <Skeleton height={240} radius="md" />
                </Grid.Col>
              ))}
            </Grid>
          ) : filtered.length === 0 ? (
            <Stack align="center" py="xl">
              <Text c="dimmed">Hiện không có sản phẩm nào</Text>
              <Button variant="light">Tải lại</Button>
            </Stack>
          ) : (
            <Grid gutter="lg">
              {filtered.map((item) => (
                <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <AuctionCard
                    id={item.id}
                    title={item.title}
                    thumbnail={item.thumbnail}
                    currentPrice={item.currentPrice}
                    timeLeftLabel={formatTimeLeft(item.endsAt, Date.now())}
                    onBid={(id) => console.log(`TODO bid item id: ${id}`)}
                  />
                </Grid.Col>
              ))}
            </Grid>
          )}
        </Container>
      </AppShell.Main>
      <AppShell.Footer>
        <AppFooter />
      </AppShell.Footer>
    </AppShell>
  );
}
