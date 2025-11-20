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
  Skeleton,
  Alert,
} from '@mantine/core';
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
  
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImg, setMainImg] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [opened, setOpened] = useState<boolean>(false);
  const [bid, setBid] = useState<number | ''>('');
  const tickRef = useRef<number | null>(null);

  // Fetch auction and product data
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch auction detail (single object, not wrapped)
        const auctionRes = await api.get(`/auctions/${parsedId}`, { timeout: 10000 });
        const auctionData: AuctionData = auctionRes.data;
        
        if (cancelled) return;
        setAuction(auctionData);
        
        // Fetch product detail (auction detail doesn't include product)
        if (auctionData.product_id) {
          try {
            const productRes = await api.get(`/products/${auctionData.product_id}`, { timeout: 10000 });
            const productData: ProductData = productRes.data;
            if (!cancelled) {
              setProduct(productData);
              // Set main image
              const firstImage = 
                productData.thumbnail ||
                (Array.isArray(productData.detail_images) && productData.detail_images.length > 0
                  ? productData.detail_images[0]
                  : null) ||
                PLACEHOLDER_IMG;
              setMainImg(firstImage);
            }
          } catch (err) {
            console.error('Failed to fetch product:', err);
            if (!cancelled) setError('Failed to load product information');
          }
        }
        
        // Fetch bid history
        try {
          const bidsRes = await api.get(`/auctions/${parsedId}/bids`, { timeout: 10000 });
          const bids = Array.isArray(bidsRes.data) ? bidsRes.data : [];
          if (!cancelled) {
            setBidHistory(
              bids.map((b: any) => ({
                id: b.id,
                user: b.bidder_name || b.bidder_username || `User #${b.bidder_id || b.id}`,
                amount: Number(b.amount || 0),
                time: b.created_at ? new Date(b.created_at).toLocaleString() : new Date().toLocaleString(),
              }))
            );
          }
        } catch (err) {
          console.warn('Failed to fetch bid history:', err);
          // Bid history is optional, don't set error
        }
      } catch (err: any) {
        console.error('Failed to fetch auction:', err);
        if (!cancelled) {
          setError(err.response?.data?.detail || 'Failed to load auction details');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    
    if (parsedId) {
      fetchData();
    }
    
    return () => {
      cancelled = true;
    };
  }, [parsedId]);

  // Update countdown timer
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

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Skeleton height={400} radius="md" mb="md" />
        <Skeleton height={200} radius="md" />
      </Container>
    );
  }

  if (error || !auction) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="Error">
          {error || 'Auction not found'}
        </Alert>
      </Container>
    );
  }

  const currentPrice = Number(auction.current_price || auction.start_price || 0);
  const heat = auction.bid_count || 0;

  return (
    <Container size="lg" py="xl">
      {/* Title row */}
      <Group justify="space-between" mb="md">
        <Stack gap={4}>
          <Title order={2} style={{ lineHeight: 1.2 }}>
            {product?.name || `Auction #${auction.id}`}
          </Title>
          <Group gap="sm">
            <Badge variant="light" color="orange">#{auction.id}</Badge>
            <Text c="dimmed">Bids: {heat}</Text>
            {auction.status && (
              <Badge variant="light" color={auction.status === 'active' ? 'green' : 'gray'}>
                {auction.status}
              </Badge>
            )}
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
            <Image src={mainImg || PLACEHOLDER_IMG} alt={product?.name || `Auction #${auction.id}`} radius="md" fit="contain" h={420} />
            {gallery.length > 1 && (
              <Group gap="sm" mt="md" wrap="nowrap">
                {gallery.slice(0, 5).map((src, idx) => (
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
            )}
            {product?.description && (
              <Stack gap="sm" mt="md">
                <Title order={4}>Description</Title>
                <Text>{product.description}</Text>
              </Stack>
            )}
          </Grid.Col>

          {/* Right column: pricing & CTA */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="sm">
              <Text c="dimmed">Current price</Text>
              <Title order={2} style={{ fontSize: 40, lineHeight: 1 }}>${currentPrice.toFixed(2)}</Title>
              {auction.buy_now_price && (
                <>
                  <Text c="dimmed" size="sm">Buy now price</Text>
                  <Text fw={600} size="lg">${Number(auction.buy_now_price).toFixed(2)}</Text>
                </>
              )}
              <Group gap="xs">
                <Text c="dimmed">Ends in</Text>
                <Text fw={700}>{timeLeft}</Text>
              </Group>
              <Button 
                color="orange" 
                radius="xl" 
                size="md" 
                onClick={() => setOpened(true)}
                disabled={auction.status !== 'active'}
              >
                Place bid
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Bid history */}
      <Title order={3} mt="xl" mb="sm">Bid History</Title>
      <Divider mb="md" />
      {bidHistory.length === 0 ? (
        <Text c="dimmed">No bids yet. Be the first to bid!</Text>
      ) : (
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
                <Table.Td>${b.amount.toFixed(2)}</Table.Td>
                <Table.Td>{b.time}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {/* Place bid modal */}
      <Modal opened={opened} onClose={() => setOpened(false)} title="Place your bid" centered>
        <Stack>
          <NumberInput
            label="Bid amount (USD)"
            placeholder={`${(currentPrice + 1).toFixed(2)}`}
            min={currentPrice + 1}
            value={bid}
            onChange={(val) => setBid(typeof val === 'number' ? val : '')}
            thousandSeparator
            decimalScale={2}
          />
          <Button 
            color="orange" 
            radius="xl" 
            onClick={async () => {
              if (typeof bid === 'number' && bid > currentPrice) {
                try {
                  await api.post(`/auctions/${parsedId}/bids`, { amount: bid });
                  // Refresh auction and bid history
                  window.location.reload();
                } catch (err: any) {
                  alert(err.response?.data?.detail || 'Failed to place bid');
                }
              }
              setOpened(false);
            }}
          >
            Confirm
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
}
