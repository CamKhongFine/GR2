import { useEffect, useMemo, useRef, useState } from 'react';
import HeaderBar from '../components/Header';
import AuctionCard from '../components/AuctionCard';
import {
  AppShell,
  Box,
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
  Affix,
  ActionIcon,
} from '@mantine/core';
import { Transition } from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { IconArrowUp } from '@tabler/icons-react';

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
  const [tick, setTick] = useState(0); // keep ticking to refresh countdown labels
  const [heroReady, setHeroReady] = useState(false);
  const [scroll, scrollTo] = useWindowScroll();
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollYRef = useRef<number>(0);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Simulate fetching data
  useEffect(() => {
    const t = setTimeout(() => {
      setItems(mockItemsSeed);
      setLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setHeroReady(true);
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

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoadingMore && hasMore && !loading) {
          // debounce load more
          loadMore();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoadingMore, hasMore, loading, tab, items.length]);

  // Smart, auto-hiding fixed header
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const last = lastScrollYRef.current;
      if (y <= 0) {
        if (isHeaderHidden) setIsHeaderHidden(false);
      } else if (y > last && y > 80) {
        if (!isHeaderHidden) setIsHeaderHidden(true);
      } else if (y < last) {
        if (isHeaderHidden) setIsHeaderHidden(false);
      }
      lastScrollYRef.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHeaderHidden]);

  function loadMore() {
    setIsLoadingMore(true);
    // Simulate async fetch latency
    setTimeout(() => {
      const nextPage = page + 1;
      // Create more items based on seed with new ids
      const extra = mockItemsSeed.map((it) => ({
        ...it,
        id: it.id + nextPage * 1000 + Math.floor(Math.random() * 100),
        createdAt: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60),
        endsAt: Date.now() + Math.floor(Math.random() * 1000 * 60 * 90),
        heat: Math.floor(Math.random() * 10) + 1,
        currentPrice: Math.max(10, it.currentPrice + Math.floor(Math.random() * 50) - 10),
      }));
      const newItems = [...items, ...extra];
      setItems(newItems);
      setPage(nextPage);
      // Stop after 8 pages for demo
      if (nextPage >= 8) setHasMore(false);
      setIsLoadingMore(false);
    }, 700);
  }

  const filtered = useMemo(() => {
    if (tab === 'latest') return [...items].sort((a, b) => b.createdAt - a.createdAt);
    if (tab === 'ending') return [...items].sort((a, b) => a.endsAt - b.endsAt);
    if (tab === 'hot') return [...items].sort((a, b) => b.heat - a.heat);
    return items;
  }, [items, tab]);

  return (
    <>
    <AppShell
      header={{ height: 72 }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#F5F7FB',
          fontFamily: 'Inter, Poppins, sans-serif',
          paddingTop: 72,
        },
      }}
    >
      <AppShell.Header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transform: isHeaderHidden ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 220ms ease',
          background: '#FFFFFF',
          borderBottom: '1px solid #EEEEEE',
        }}
      >
        <HeaderBar />
      </AppShell.Header>
      <AppShell.Main>
        {/* Hero Section */}
        <Box
          component="section"
          style={{
            background: 'linear-gradient(90deg, #007BFF 0%, #5C67F2 100%)',
            color: '#ffffff',
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 0',
            marginBottom: 24,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container size="lg" style={{ textAlign: 'center' }}>
            <Stack
              gap="md"
              style={{
                maxWidth: 760,
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? 'translateY(0px)' : 'translateY(8px)',
                transition: 'opacity 450ms ease, transform 450ms ease',
              }}
              align="center"
            >
              <Title
                order={1}
                style={{
                  fontSize: 'clamp(28px, 5vw, 44px)',
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                  lineHeight: 1.1,
                  textShadow: '0 12px 24px rgba(15, 23, 42, 0.25)',
                }}
              >
                Săn Lùng Món Hàng Độc Nhất
              </Title>
              <Text
                size="lg"
                style={{
                  color: '#E0E8FF',
                  maxWidth: 620,
                  lineHeight: 1.6,
                }}
              >
                Đấu giá ngay, rinh quà liền tay. Nền tảng đấu giá thời gian thực mang đến trải nghiệm chuyên nghiệp cho tất cả mọi người.
              </Text>
              <Group mt="md" gap="sm" justify="center">
                <Button
                  component="a"
                  href="#auctions"
                  size="md"
                  radius="xl"
                  color="orange"
                  style={{ fontWeight: 600, boxShadow: '0 12px 24px rgba(255, 122, 0, 0.35)' }}
                >
                  Xem các sản phẩm đang đấu giá
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  radius="xl"
                  color="white"
                  style={{
                    borderColor: 'rgba(255,255,255,0.7)',
                    color: '#ffffff',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    fontWeight: 600,
                  }}
                >
                  Tìm hiểu thêm
                </Button>
              </Group>

              {/* Optional: Featured minis */}
              <Group mt="md" gap="md" justify="center" wrap="wrap">
                {items.slice(0, 3).map((it) => (
                  <Box
                    key={`feat-${it.id}`}
                    style={{
                      width: 180,
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      boxShadow: '0 10px 24px rgba(15, 23, 42, 0.14)',
                      overflow: 'hidden',
                      transform: 'translateZ(0)',
                      transition: 'transform 160ms ease, box-shadow 160ms ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 18px 32px rgba(255, 122, 0, 0.18)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.14)';
                    }}
                  >
                    <img src={it.thumbnail} alt={it.title} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                    <Text fw={700} size="sm" style={{ padding: '10px 12px', color: '#0F172A' }} lineClamp={2}>
                      {it.title}
                    </Text>
                  </Box>
                ))}
              </Group>
            </Stack>
          </Container>
        </Box>

        <Container size="lg" id="auctions" style={{ marginBottom: 80 }}>
          <Group justify="space-between" mb="lg" align="flex-start">
            <Stack gap={8} style={{ flex: 1 }}>
              <Title order={2} style={{ fontWeight: 800, letterSpacing: '-0.4px' }}>Sản Phẩm Đang Đấu Giá</Title>
              <Text c="dimmed" size="sm">
                Khám phá những món hàng hot nhất được cập nhật liên tục theo thời gian thực.
              </Text>
            </Stack>
            <Badge
              variant="light"
              size="md"
              style={{
                backgroundColor: '#E0F2FE',
                color: '#007BFF',
                borderRadius: 999,
                fontWeight: 600,
                letterSpacing: 0.2,
                textTransform: 'uppercase',
              }}
            >
              {items.length} items
            </Badge>
          </Group>

          {/* Filters / Tabs */}
          <Tabs
            value={tab}
            onChange={setTab}
            mb="md"
            variant="pills"
            radius="xl"
            color="orange"
          >
            <Tabs.List
              style={{
                backgroundColor: '#F1F5F9',
                padding: 6,
                borderRadius: 999,
                gap: 6,
                border: '1px solid rgba(148, 163, 184, 0.25)',
              }}
            >
              <Tabs.Tab value="featured" style={{ fontWeight: 600, letterSpacing: 0.2 }}>Nổi bật</Tabs.Tab>
              <Tabs.Tab value="latest" style={{ fontWeight: 600, letterSpacing: 0.2 }}>Mới nhất</Tabs.Tab>
              <Tabs.Tab value="ending" style={{ fontWeight: 600, letterSpacing: 0.2 }}>Sắp kết thúc</Tabs.Tab>
              <Tabs.Tab value="hot" style={{ fontWeight: 600, letterSpacing: 0.2 }}>Hot nhất</Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {/* Loading state */}
          {loading ? (
            <Grid gutter="xl">
              {Array.from({ length: 8 }).map((_, i) => (
                <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <Skeleton height={280} radius={16} />
                </Grid.Col>
              ))}
            </Grid>
          ) : filtered.length === 0 ? (
            <Stack align="center" py="xl">
              <Text c="dimmed">Hiện không có sản phẩm nào</Text>
              <Button variant="light" radius="xl" color="orange">Tải lại</Button>
            </Stack>
          ) : (
            <Grid gutter="xl">
              {filtered.map((item) => (
                <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <AuctionCard
                    id={item.id}
                    title={item.title}
                    thumbnail={item.thumbnail}
                    currentPrice={item.currentPrice}
                    timeLeftLabel={formatTimeLeft(item.endsAt, Date.now() + tick)}
                    onBid={(id) => console.log(`TODO bid item id: ${id}`)}
                  />
                </Grid.Col>
              ))}
              {/* Sentinel for infinite scroll */}
              <Grid.Col span={12}>
                <div ref={sentinelRef} style={{ height: 1 }} />
              </Grid.Col>
            </Grid>
          )}

          {/* Load more indicator */}
          {isLoadingMore && (
            <Stack align="center" mt="md">
              <Skeleton height={8} radius="xl" style={{ width: 180 }} />
            </Stack>
          )}
        </Container>
        <Affix position={{ bottom: 32, right: 32 }}>
          <Transition transition="slide-up" mounted={scroll.y > 800}>
            {(transitionStyles) => (
              <ActionIcon
                size={48}
                radius="xl"
                color="orange"
                variant="filled"
                style={transitionStyles}
                onClick={() => scrollTo({ y: 0 })}
                aria-label="Scroll to top"
              >
                <IconArrowUp size={22} />
              </ActionIcon>
            )}
          </Transition>
        </Affix>
      </AppShell.Main>
    </AppShell>
    </>
  );
}
