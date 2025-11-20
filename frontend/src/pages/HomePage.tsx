import { useEffect, useMemo, useRef, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import AuctionCard from '../components/AuctionCard';
import api from '../utils/api';
import HeroArt from '../assets/images/Hero.png';
import {
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
  Modal,
  Image,
  Divider,
  Loader,
  Alert,
  Paper,
  ScrollArea,
} from '@mantine/core';
import { Transition } from '@mantine/core';
import { useWindowScroll, useDisclosure } from '@mantine/hooks';
import { IconArrowUp } from '@tabler/icons-react';

type AuctionItem = {
  id: number;
  title: string;
  thumbnail: string;
  currentPrice: number;
  endsAt: number;
  createdAt: number;
  heat: number;
  productId?: number;
};

type ProductData = {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  image_gallery: string[] | null;
  detail_images: string[] | null;
  thumbnail: string | null;
};

// Backend-driven pagination
const PAGE_SIZE = 12;
const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop';

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
  const [tick, setTick] = useState(0); // keep ticking to refresh countdown labels
  const [heroReady, setHeroReady] = useState(false);
  
  // Quick view modal state
  const [quickViewOpened, { open: openQuickView, close: closeQuickView }] = useDisclosure(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductData | null>(null);
  const [quickViewLoading, setQuickViewLoading] = useState(false);
  const [quickViewError, setQuickViewError] = useState<string | null>(null);
  const [quickViewAuctionId, setQuickViewAuctionId] = useState<number | null>(null);
  const [scroll, scrollTo] = useWindowScroll();
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Initial fetch from backend - only active auctions
  useEffect(() => {
    let cancelled = false;
    async function fetchFirst() {
      try {
        setLoading(true);
        const res = await api.get('/auctions', {
          params: { limit: PAGE_SIZE, offset: 0 },
          timeout: 10000,
        });
        // Response format: { auctions: [...] }
        const data = Array.isArray(res.data?.auctions) ? res.data.auctions : [];
        const now = Date.now();
        
        // Filter valid auctions (exclude ended/cancelled/sold and not started yet)
        const excludedStatuses = ['ended', 'cancelled', 'sold'];
        const validAuctions = data.filter((a: any) => {
          if (!a.end_time) return false;
          // Exclude ended/cancelled/sold auctions
          if (a.status && excludedStatuses.includes(a.status)) return false;
          // Check if auction has started
          if (a.start_time) {
            const startTime = new Date(a.start_time).getTime();
            if (startTime > now) return false; // Auction hasn't started yet
          }
          const endTime = new Date(a.end_time).getTime();
          // Only show auctions that haven't ended
          return endTime > now;
        });

        // Map auctions - use title and thumbnail directly from auction
        const mapped: AuctionItem[] = validAuctions.map((a: any) => {
          const endTime = new Date(a.end_time).getTime();
          
          return {
            id: a.id,
            title: a.title || `Auction #${a.id}`,
            thumbnail: a.thumbnail || PLACEHOLDER_IMG,
            currentPrice: Number(a.current_price || a.start_price || 0),
            endsAt: endTime,
            createdAt: a.created_at ? new Date(a.created_at).getTime() : now,
            heat: Number(a.bid_count || 0),
            productId: a.product_id,
          };
        });
        
        if (!cancelled) {
          setItems(mapped);
          setHasMore(mapped.length >= PAGE_SIZE);
        }
      } catch (error) {
        console.error('Failed to fetch auctions:', error);
        if (!cancelled) {
          setItems([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFirst();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reload handler
  const handleReload = async () => {
    setLoading(true);
    setItems([]);
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);
    
    try {
      const res = await api.get('/auctions', {
        params: { limit: PAGE_SIZE, offset: 0 },
        timeout: 10000,
      });
      const data = Array.isArray(res.data?.auctions) ? res.data.auctions : [];
      const now = Date.now();
      
      const excludedStatuses = ['ended', 'cancelled', 'sold'];
      const validAuctions = data.filter((a: any) => {
        if (!a.end_time) return false;
        if (a.status && excludedStatuses.includes(a.status)) return false;
        if (a.start_time) {
          const startTime = new Date(a.start_time).getTime();
          if (startTime > now) return false;
        }
        const endTime = new Date(a.end_time).getTime();
        return endTime > now;
      });

      const mapped: AuctionItem[] = validAuctions.map((a: any) => {
        const endTime = new Date(a.end_time).getTime();
        return {
          id: a.id,
          title: a.title || `Auction #${a.id}`,
          thumbnail: a.thumbnail || PLACEHOLDER_IMG,
          currentPrice: Number(a.current_price || a.start_price || 0),
          endsAt: endTime,
          createdAt: a.created_at ? new Date(a.created_at).getTime() : now,
          heat: Number(a.bid_count || 0),
          productId: a.product_id,
        };
      });
      
      setItems(mapped);
      setHasMore(mapped.length >= PAGE_SIZE);
    } catch (error) {
      console.error('Failed to reload auctions:', error);
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Quick view handler
  const handleQuickView = async (auctionId: number) => {
    try {
      setQuickViewLoading(true);
      setQuickViewError(null);
      setQuickViewAuctionId(auctionId);
      openQuickView();
      
      // Find auction to get product_id
      const auction = items.find(item => item.id === auctionId);
      let productId: number | undefined = auction?.productId;
      
      // If productId not found in items, fetch auction detail
      if (!productId) {
        const auctionRes = await api.get(`/auctions/${auctionId}`);
        const auctionData = auctionRes.data;
        productId = auctionData.product_id;
      }
      
      if (productId) {
        // Fetch product detail
        const productRes = await api.get(`/products/${productId}`);
        setQuickViewProduct(productRes.data);
      } else {
        setQuickViewError('Product information not available');
      }
    } catch (err: any) {
      console.error('Failed to fetch product for quick view:', err);
      setQuickViewError(err.response?.data?.detail || 'Failed to load product details');
    } finally {
      setQuickViewLoading(false);
    }
  };

  useEffect(() => {
    setHeroReady(true);
  }, []);

  // Countdown tick for UI labels
  useEffect(() => {
    tickRef.current = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
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


  async function loadMore() {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const offset = (nextPage - 1) * PAGE_SIZE;
      const res = await api.get('/auctions', {
        params: { limit: PAGE_SIZE, offset },
        timeout: 10000,
      });
      // Response format: { auctions: [...] }
      const data = Array.isArray(res.data?.auctions) ? res.data.auctions : [];
      const now = Date.now();
      
      // Filter valid auctions (exclude ended/cancelled/sold and not started yet)
      const excludedStatuses = ['ended', 'cancelled', 'sold'];
      const validAuctions = data.filter((a: any) => {
        if (!a.end_time) return false;
        // Exclude ended/cancelled/sold auctions
        if (a.status && excludedStatuses.includes(a.status)) return false;
        // Check if auction has started
        if (a.start_time) {
          const startTime = new Date(a.start_time).getTime();
          if (startTime > now) return false; // Auction hasn't started yet
        }
        const endTime = new Date(a.end_time).getTime();
        // Only show auctions that haven't ended
        return endTime > now;
      });

      // Map auctions - use title and thumbnail directly from auction
      const extra: AuctionItem[] = validAuctions.map((a: any) => {
        const endTime = new Date(a.end_time).getTime();
        
        return {
          id: a.id,
          title: a.title || `Auction #${a.id}`,
          thumbnail: a.thumbnail || PLACEHOLDER_IMG,
          currentPrice: Number(a.current_price || a.start_price || 0),
          endsAt: endTime,
          createdAt: a.created_at ? new Date(a.created_at).getTime() : now,
          heat: Number(a.bid_count || 0),
          productId: a.product_id,
        };
      });
      
      setItems((prev) => [...prev, ...extra]);
      setPage(nextPage);
      setHasMore(extra.length >= PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load more auctions:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }

  const filtered = useMemo(() => {
    if (tab === 'latest') return [...items].sort((a, b) => b.createdAt - a.createdAt);
    if (tab === 'ending') return [...items].sort((a, b) => a.endsAt - b.endsAt);
    if (tab === 'hot') return [...items].sort((a, b) => b.heat - a.heat);
    return items;
  }, [items, tab]);

  return (
    <MainLayout>
        {/* Hero Section */}
        <Box
          component="section"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(11, 20, 38, 0.65), rgba(11, 20, 38, 0.35)), url(${HeroArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
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
                Đấu giá ngay, rinh quà liền tay. Nền tảng đấu giá thời gian thực mang đến trải nghiệm chuyên nghiệp cho tất cả mọi người
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
                Khám phá những món hàng hot nhất được cập nhật liên tục theo thời gian thực
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
                marginTop: 45,
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
              <Button 
                variant="light" 
                radius="xl" 
                color="orange"
                onClick={handleReload}
                loading={loading}
              >
                Tải lại
              </Button>
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
                    onQuickView={handleQuickView}
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

    <Modal
      opened={quickViewOpened}
      onClose={closeQuickView}
      title="Product Quick View"
      size="lg"
      centered
      styles={{
        body: { padding: 0 },
        content: { overflow: 'hidden' },
      }}
    >
      {quickViewLoading ? (
        <Stack align="center" py="xl" px="md">
          <Loader size="lg" />
          <Text c="dimmed" size="sm">Loading product details...</Text>
        </Stack>
      ) : quickViewError ? (
        <Alert color="red" title="Error" m="md">
          {quickViewError}
        </Alert>
      ) : quickViewProduct ? (
        <ScrollArea h={600}>
          <Stack gap={0}>
            <Paper p="md" withBorder={false} style={{ borderBottom: '1px solid #EEEEEE' }}>
              <Image
                src={
                  quickViewProduct.thumbnail ||
                  (Array.isArray(quickViewProduct.detail_images) && quickViewProduct.detail_images.length > 0
                    ? quickViewProduct.detail_images[0]
                    : null) ||
                  PLACEHOLDER_IMG
                }
                alt={quickViewProduct.name}
                mah={400}
                fit="cover"
                radius="md"
                style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
              />
            </Paper>

            <Stack gap="md" p="md">
              <Stack gap="xs">
                <Title order={3} size="h4" fw={700}>
                  {quickViewProduct.name}
                </Title>
                {quickViewProduct.description && (
                  <Text c="dimmed" size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {quickViewProduct.description}
                  </Text>
                )}
              </Stack>

              {Array.isArray(quickViewProduct.detail_images) && quickViewProduct.detail_images.length > 0 && (
                <>
                  <Divider />
                  <Stack gap="xs">
                    <Text fw={600} size="sm" c="dimmed">
                      Additional Images
                    </Text>
                    <ScrollArea type="scroll" scrollbars="x">
                      <Group gap="xs" style={{ flexWrap: 'nowrap' }}>
                        {quickViewProduct.detail_images.map((img, idx) => (
                          <Image
                            key={idx}
                            src={img}
                            alt={`${quickViewProduct.name} - Image ${idx + 1}`}
                            h={100}
                            w={100}
                            fit="cover"
                            radius="md"
                            style={{ flexShrink: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
                          />
                        ))}
                      </Group>
                    </ScrollArea>
                  </Stack>
                </>
              )}

              <Divider />

              <Group justify="flex-end" gap="sm" mt="xs">
                <Button variant="subtle" onClick={closeQuickView} size="md">
                  Close
                </Button>
                <Button
                  color="orange"
                  size="md"
                  onClick={() => {
                    closeQuickView();
                    if (quickViewAuctionId) {
                      window.location.href = `/auction/${quickViewAuctionId}`;
                    }
                  }}
                >
                  View Details
                </Button>
              </Group>
            </Stack>
          </Stack>
        </ScrollArea>
      ) : null}
    </Modal>
    </MainLayout>
  );
}
