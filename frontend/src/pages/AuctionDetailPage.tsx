import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Image,
  Group,
  Stack,
  Title,
  Text,
  Button,
  Modal,
  NumberInput,
  Table,
  Divider,
  Paper,
  Skeleton,
  Alert,
  ActionIcon,
  Center,
  Tooltip,
} from '@mantine/core';
import { IconArrowLeft, IconGavel } from '@tabler/icons-react';
import MainLayout from '../layouts/MainLayout';
import api from '../utils/api';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop';

type AuctionData = {
  id: number;
  product_id: number;
  current_price: number;
  start_price: number;
  buy_now_price: number | null;
  end_time: string;
  start_time: string;
  status: string;
  bid_count?: number;
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

type BidHistoryItem = {
  id: number;
  user: string;
  amount: number;
  time: string;
};

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
  const navigate = useNavigate();
  
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImg, setMainImg] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [opened, setOpened] = useState<boolean>(false);
  const [bid, setBid] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const tickRef = useRef<number | null>(null);

  const getUserInfo = () => {
    try {
      const userInfoStr = localStorage.getItem('user_info');
      if (userInfoStr) {
        return JSON.parse(userInfoStr);
      }
    } catch (e) {
      console.error('Failed to parse user info:', e);
    }
    return null;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const auctionRes = await api.get(`/auctions/${parsedId}`, { timeout: 10000 });
      const auctionData: AuctionData = auctionRes.data;
      setAuction(auctionData);
      
      if (auctionData.product_id) {
        try {
          const productRes = await api.get(`/products/${auctionData.product_id}`, { timeout: 10000 });
          const productData: ProductData = productRes.data;
          setProduct(productData);
          const firstImage = 
            productData.thumbnail ||
            (Array.isArray(productData.detail_images) && productData.detail_images.length > 0
              ? productData.detail_images[0]
              : null) ||
            PLACEHOLDER_IMG;
          setMainImg(firstImage);
        } catch (err) {
          console.error('Failed to fetch product:', err);
          setError('Failed to load product information');
        }
      }
      
      try {
        const bidsRes = await api.get(`/bids/auction/${parsedId}`, { timeout: 10000 });
        const bids = Array.isArray(bidsRes.data) ? bidsRes.data : [];
        setBidHistory(
          bids.map((b: any) => ({
            id: b.id,
            user: b.bidder_name || b.bidder_username || `User #${b.bidder_id || b.id}`,
            amount: Number(b.bid_amount || 0),
            time: b.bid_time || b.created_at ? new Date(b.bid_time || b.created_at).toLocaleString() : new Date().toLocaleString(),
          }))
        );
      } catch (err: any) {
        console.warn('Failed to fetch bid history:', err);
      }
    } catch (err: any) {
      console.error('Failed to fetch auction:', err);
      setError(err.response?.data?.detail || 'Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parsedId) {
      fetchData();
    }
  }, [parsedId]);

  useEffect(() => {
    if (!auction) return;
    
    const updateTimer = () => {
      setTimeLeft(formatTimeLeft(new Date(auction.end_time).getTime()));
    };
    
    updateTimer();
    tickRef.current = window.setInterval(updateTimer, 1000);
    
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [auction]);

  const gallery = useMemo(() => {
    if (!product) return [PLACEHOLDER_IMG];
    const images: string[] = [];
    if (product.thumbnail) images.push(product.thumbnail);
    if (Array.isArray(product.detail_images)) {
      product.detail_images.forEach(img => {
        if (img && !images.includes(img)) images.push(img);
      });
    }
    return images.length > 0 ? images : [PLACEHOLDER_IMG];
  }, [product]);

  const canPlaceBid = useMemo(() => {
    if (!auction || auction.status !== 'active') return false;
    const now = Date.now();
    const startTime = new Date(auction.start_time).getTime();
    const endTime = new Date(auction.end_time).getTime();
    return startTime <= now && endTime > now;
  }, [auction]);

  const currentPrice = useMemo(() => {
    return auction ? Number(auction.current_price || auction.start_price || 0) : 0;
  }, [auction]);

  if (loading) {
    return (
      <Container size={1200} py="xl">
        <Skeleton height={400} radius="md" mb="md" />
        <Skeleton height={200} radius="md" />
      </Container>
    );
  }

  if (error || !auction) {
    return (
      <Container size={1200} py="xl">
        <Alert color="red" title="Error">
          {error || 'Auction not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <MainLayout>
      <Container size={1200} py="xl">
        <Group mb="md">
          <Tooltip label="Back to Home" withArrow>
            <ActionIcon
              variant="subtle"
              size="lg"
              radius="md"
              onClick={() => navigate(-1)}
              aria-label="Back to Home"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <Paper withBorder radius="md" p="md" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
                <Image
                  src={mainImg || PLACEHOLDER_IMG}
                  alt={product?.name || `Auction #${auction.id}`}
                  radius="md"
                  fit="cover"
                  mah={500}
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
              </Paper>

              {gallery.length > 1 && (
                <Group gap="xs" wrap="nowrap">
                  {gallery.map((src, idx) => (
                    <Paper
                      key={src + idx}
                      withBorder
                      radius="sm"
                      p={4}
                      style={{
                        cursor: 'pointer',
                        border: src === mainImg ? '2px solid var(--mantine-color-orange-6)' : '1px solid #E0E0E0',
                        flexShrink: 0,
                      }}
                      onClick={() => setMainImg(src)}
                    >
                      <Image
                        src={src}
                        alt={`thumb-${idx}`}
                        radius="xs"
                        h={80}
                        w={80}
                        fit="cover"
                      />
                    </Paper>
                  ))}
                </Group>
              )}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper withBorder radius="md" p="lg" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
              <Stack gap="lg">
                <Stack gap="xs">
                  <Text c="dimmed" size="sm" fw={500}>Current Price</Text>
                  <Title order={1} fw={700} size={48} c="#0F172A">
                    ${currentPrice.toFixed(2)}
                  </Title>
                </Stack>

                {auction.buy_now_price && (
                  <Stack gap="xs">
                    <Text c="dimmed" size="sm" fw={500}>Buy Now Price</Text>
                    <Text fw={600} size="xl" c="#64748B">
                      ${Number(auction.buy_now_price).toFixed(2)}
                    </Text>
                  </Stack>
                )}

                <Divider />

                <Stack gap="xs">
                  <Text c="dimmed" size="sm" fw={500}>Time Remaining</Text>
                  <Text fw={700} size="xl" c="#FF7A00">
                    {timeLeft}
                  </Text>
                </Stack>

                <Button
                  color="orange"
                  size="lg"
                  radius="md"
                  fullWidth
                  onClick={() => setOpened(true)}
                  disabled={!canPlaceBid}
                  style={{ fontWeight: 600 }}
                >
                  Place Bid
                </Button>

                <Group gap="xs" justify="center">
                  <Text c="dimmed" size="sm">
                    {bidHistory.length} {bidHistory.length === 1 ? 'bid' : 'bids'}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {product?.description && (
          <>
            <Divider my="xl" />
            <Stack gap="md">
              <Title order={3} fw={600}>Description</Title>
              <Text size="md" style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {product.description}
              </Text>
            </Stack>
          </>
        )}

        <Divider my="xl" />

        <Stack gap="md">
          <Title order={3} fw={600}>Bid History</Title>
          {bidHistory.length === 0 ? (
            <Paper withBorder radius="md" p="xl">
              <Center>
                <Stack gap="sm" align="center">
                  <IconGavel size={48} stroke={1.5} color="var(--mantine-color-gray-5)" />
                  <Text c="dimmed" size="md">No bids yet</Text>
                  <Text c="dimmed" size="sm">Be the first to place a bid!</Text>
                </Stack>
              </Center>
            </Paper>
          ) : (
            <Paper withBorder radius="md" p="md">
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
                      <Table.Td fw={500}>{b.user}</Table.Td>
                      <Table.Td fw={600} c="orange">${b.amount.toFixed(2)}</Table.Td>
                      <Table.Td c="dimmed">{b.time}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          )}
        </Stack>
      </Container>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Place your bid" centered>
        <Stack gap="md">
          <NumberInput
            label="Bid amount (USD)"
            placeholder={`${(currentPrice + 1).toFixed(2)}`}
            min={currentPrice + 1}
            value={bid}
            onChange={(val) => setBid(typeof val === 'number' ? val : '')}
            thousandSeparator
            decimalScale={2}
            size="md"
          />
          {bidError && (
            <Alert color="red" onClose={() => setBidError(null)}>
              {bidError}
            </Alert>
          )}
          <Button
            color="orange"
            size="md"
            radius="md"
            fullWidth
            loading={submitting}
            onClick={async () => {
              if (typeof bid !== 'number' || bid <= currentPrice) {
                setBidError(`Bid amount must be greater than current price ($${currentPrice.toFixed(2)})`);
                return;
              }

              const userInfo = getUserInfo();
              if (!userInfo || !userInfo.id) {
                setBidError('Please login to place a bid');
                return;
              }

              setSubmitting(true);
              setBidError(null);
              
              try {
                await api.post('/bids/', {
                  auction_id: parsedId,
                  bidder_id: userInfo.id,
                  bid_amount: bid,
                });
                
                await fetchData();
                setOpened(false);
                setBid('');
              } catch (err: any) {
                console.error('Failed to place bid:', err);
                setBidError(err.response?.data?.detail || 'Failed to place bid. Please try again.');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            Confirm Bid
          </Button>
        </Stack>
      </Modal>
    </MainLayout>
  );
}
