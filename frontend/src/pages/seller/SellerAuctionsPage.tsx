import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  Group,
  Text,
  Badge,
  Paper,
  Stack,
  Modal,
  NumberInput,
  Select,
  Image,
  Alert,
  Skeleton,
  TextInput,
  Box,
  Flex,
  SimpleGrid,
  Divider,
  rem,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEye,
  IconInfoCircle,
  IconAlertCircle,
  IconGavel,
  IconSearch,
  IconFilterOff,
  IconChevronDown,
  IconPackage,
} from '@tabler/icons-react';
import '@mantine/dates/styles.css';
import api from '../../utils/api';

type Auction = {
  id: number;
  product_id: number;
  start_price: number;
  current_price: number;
  buy_now_price: number | null;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  image_gallery: string[] | null;
  condition: string;
  category_id: number | null;
};

type AuctionFormValues = {
  product_id: number | null;
  start_price: number | '';
  buy_now_price: number | '';
  start_time: Date | null;
  end_time: Date | null;
};

export default function SellerAuctionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [errorModalOpened, { open: openErrorModal, close: closeErrorModal }] = useDisclosure(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userInfo] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('user_info') || 'null');
    } catch {
      return null;
    }
  });
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>('Newest');

  const form = useForm<AuctionFormValues>({
    initialValues: {
      product_id: null,
      start_price: '',
      buy_now_price: '',
      start_time: new Date(),
      end_time: null,
    },
    validate: {
      product_id: (value) => (!value ? 'Product is required' : null),
      start_price: (value) => {
        if (value === '' || value === null) return 'Start price is required';
        if (typeof value === 'number' && value <= 0) return 'Start price must be greater than 0';
        return null;
      },
      end_time: (value) => {
        if (!value) return 'End time is required';
        if (form.values.start_time && value <= form.values.start_time) {
          return 'End time must be after start time';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    const productIdParam = searchParams.get('product_id');
    if (productIdParam && userInfo?.id) {
      const numericId = parseInt(productIdParam, 10);
      handleOpenModal(numericId);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('product_id');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, userInfo?.id]);

  const normalizeAuction = useCallback(
    (auction: any): Auction => ({
      ...auction,
      start_price:
        typeof auction.start_price === 'number'
          ? auction.start_price
          : parseFloat(auction.start_price ?? '0') || 0,
      current_price:
        typeof auction.current_price === 'number'
          ? auction.current_price
          : parseFloat(auction.current_price ?? '0') || 0,
      buy_now_price:
        auction.buy_now_price === null || auction.buy_now_price === undefined
          ? null
          : typeof auction.buy_now_price === 'number'
            ? auction.buy_now_price
            : parseFloat(auction.buy_now_price),
    }),
    [],
  );

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/auctions', {
        timeout: 10000,
      });
      const fetchedAuctions = Array.isArray(response.data) ? response.data : [];
      const normalizedAuctions = fetchedAuctions.map(normalizeAuction);
      setAuctions(normalizedAuctions);
      setFilteredAuctions(normalizedAuctions);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch auctions';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const normalizeProduct = useCallback(
    (product: any): Product => ({
      ...product,
      base_price:
        typeof product.base_price === 'number'
          ? product.base_price
          : parseFloat(product.base_price ?? '0') || 0,
      image_gallery: Array.isArray(product.image_gallery)
        ? product.image_gallery
        : product.image_gallery
          ? [product.image_gallery]
          : [],
    }),
    [],
  );

  // Filter and sort auctions
  useEffect(() => {
    let filtered = [...auctions];

    // Apply search filter (by auction ID or product name if available)
    if (searchQuery.trim()) {
      filtered = filtered.filter((auction) =>
        auction.id.toString().includes(searchQuery) ||
        auction.start_price.toString().includes(searchQuery) ||
        auction.current_price.toString().includes(searchQuery)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((auction) => auction.status === statusFilter);
    }

    // Apply sorting
    if (sortBy === 'Newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'Oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'Price: Low→High') {
      filtered.sort((a, b) => a.start_price - b.start_price);
    } else if (sortBy === 'Price: High→Low') {
      filtered.sort((a, b) => b.start_price - a.start_price);
    }

    setFilteredAuctions(filtered);
  }, [auctions, searchQuery, statusFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setSortBy('Newest');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== null || sortBy !== 'Newest';


  const fetchProduct = async (id: number) => {
    try {
      setLoadingProduct(true);
      const response = await api.get(`/products/${id}`, {
        timeout: 10000,
      });
      const productData = normalizeProduct(response.data);
      setSelectedProduct(productData);
      
      // Prefill form with product data
      form.setFieldValue('start_price', productData.base_price);
      form.setFieldValue('buy_now_price', '');
      form.setFieldValue('start_time', new Date());
      form.setFieldValue('end_time', null);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to load product',
        color: 'red',
      });
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleOpenModal = async (prefillProductId?: number) => {
    if (!userInfo?.id) {
      notifications.show({
        title: 'Error',
        message: 'User information is missing. Please log in again.',
        color: 'red',
      });
      return;
    }

    const sellerProducts =
      products.length > 0 ? products : await loadSellerProducts();

    if (!sellerProducts || sellerProducts.length === 0) {
      openErrorModal();
      return;
    }

    if (!prefillProductId) {
      form.reset();
      setSelectedProduct(null);
    }

    open();

    if (prefillProductId) {
      const match = sellerProducts.find((product) => product.id === prefillProductId);
      if (match) {
        handleProductSelect(prefillProductId.toString());
      } else {
        notifications.show({
          title: 'Notice',
          message: 'The selected product is no longer available.',
          color: 'yellow',
        });
      }
    }
  };

  const handleCloseModal = () => {
    close();
    form.reset();
    setSelectedProduct(null);
  };

  const handleProductSelect = (productId: string | null) => {
    if (!productId) {
      setSelectedProduct(null);
      form.setFieldValue('product_id', null);
      return;
    }
    const id = parseInt(productId, 10);
    form.setFieldValue('product_id', id);
    fetchProduct(id);
  };

  const loadSellerProducts = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!userInfo?.id) return [];
      const { silent = false } = options;
      try {
        setLoadingProducts(true);
        const response = await api.get(`/products/seller/${userInfo.id}`, {
          timeout: 10000,
        });
        const fetchedProducts = Array.isArray(response.data)
          ? response.data.map(normalizeProduct)
          : [];
        setProducts(fetchedProducts);
        return fetchedProducts;
      } catch (error: any) {
        if (!silent) {
          notifications.show({
            title: 'Error',
            message: error.response?.data?.detail || 'Failed to load products',
            color: 'red',
          });
        }
        return [];
      } finally {
        setLoadingProducts(false);
      }
    },
    [normalizeProduct, userInfo?.id],
  );

  useEffect(() => {
    if (!userInfo?.id) return;
    loadSellerProducts({ silent: true });
  }, [loadSellerProducts, userInfo?.id]);

  const handleSubmit = async (values: AuctionFormValues) => {
    if (!values.product_id) return;

    const normalizedStart =
      values.start_time instanceof Date
        ? values.start_time
        : values.start_time
        ? new Date(values.start_time)
        : null;
    const normalizedEnd =
      values.end_time instanceof Date
        ? values.end_time
        : values.end_time
        ? new Date(values.end_time)
        : null;

    if (!normalizedStart || !normalizedEnd) {
      notifications.show({
        title: 'Missing dates',
        message: 'Please select both start and end time for the auction.',
        color: 'red',
      });
      return;
    }

    try {
      setSubmitting(true);

      const startPrice =
        typeof values.start_price === 'number'
          ? values.start_price
          : parseFloat(values.start_price as string);

      if (!Number.isFinite(startPrice) || startPrice <= 0) {
        notifications.show({
          title: 'Invalid price',
          message: 'Start price must be a positive number.',
          color: 'red',
        });
        setSubmitting(false);
        return;
      }

      const rawBuyNow = values.buy_now_price;
      const hasBuyNow = rawBuyNow !== '' && rawBuyNow !== null && rawBuyNow !== undefined;
      const buyNowPrice = hasBuyNow
        ? typeof rawBuyNow === 'number'
          ? rawBuyNow
          : parseFloat(String(rawBuyNow))
        : null;

      if (buyNowPrice !== null && (!Number.isFinite(buyNowPrice) || buyNowPrice <= 0)) {
        notifications.show({
          title: 'Invalid price',
          message: 'Buy now price must be a positive number.',
          color: 'red',
        });
        setSubmitting(false);
        return;
      }

      const payload = {
        product_id: values.product_id,
        seller_id: userInfo?.id || 1,
        start_price: startPrice,
        current_price: startPrice,
        buy_now_price: buyNowPrice,
        start_time: normalizedStart.toISOString(),
        end_time: normalizedEnd.toISOString(),
        status: 'draft',
      };

      await api.post('/auctions', payload);
      
      notifications.show({
        title: 'Success',
        message: 'Auction created successfully!',
        color: 'green',
      });

      handleCloseModal();
      fetchAuctions();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to create auction',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'ended':
        return 'gray';
      case 'cancelled':
        return 'red';
      case 'sold':
        return 'orange';
      default:
        return 'blue';
    }
  };

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const getTimeRemainingLabel = (endTime: string) => {
  const end = new Date(endTime).getTime();
  const now = Date.now();
  if (Number.isNaN(end)) {
    return null;
  }
  const diff = end - now;
  if (diff <= 0) {
    return null;
  }

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
};

const getAuctionTimeStatus = (auction: Auction) => {
  const formattedEnd = formatDate(auction.end_time);
  switch (auction.status) {
    case 'active': {
      const remaining = getTimeRemainingLabel(auction.end_time);
      return remaining ? `Ends in ${remaining}` : `Ends ${formattedEnd}`;
    }
    case 'draft':
      return `Starts ${formatDate(auction.start_time)}`;
    case 'ended':
      return `Ended on ${formattedEnd}`;
    case 'sold':
      return `Sold on ${formattedEnd}`;
    case 'cancelled':
      return 'Auction cancelled';
    default:
      return `Ends ${formattedEnd}`;
  }
};

const getAuctionTimeStatusColor = (auction: Auction) => {
  switch (auction.status) {
    case 'active':
      return 'orange';
    case 'draft':
      return 'blue';
    case 'sold':
      return 'green';
    case 'cancelled':
      return 'gray';
    default:
      return 'gray';
  }
};

  const FilterChip = ({
    label,
    children,
  }: {
    label: string;
    children: ReactNode;
  }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <Paper
        withBorder
        shadow="none"
        radius="xl"
        px="sm"
        py={6}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderColor: hovered ? '#e2e6eb' : '#eff1f5',
          backgroundColor: hovered ? '#f8f9fb' : '#fff',
          transition: 'background 140ms ease, border-color 140ms ease',
        }}
      >
        <Group gap={6} align="center" wrap="nowrap">
          <Text size="sm" c="dimmed">
            {label}:
          </Text>
          <Box style={{ minWidth: 90 }}>{children}</Box>
        </Group>
      </Paper>
    );
  };

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.id.toString(),
        label: `${product.name} - ${formatCurrency(product.base_price)}`,
      })),
    [products],
  );

  const productLookup = useMemo(
    () =>
      products.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {} as Record<number, Product>),
    [products],
  );

  const AuctionCard = ({ auction }: { auction: Auction }) => {
    const [hovered, setHovered] = useState(false);
    const product = productLookup[auction.product_id];
    const imageSource =
      product?.image_url ||
      (product?.image_gallery && product.image_gallery.length > 0
        ? product.image_gallery[0]
        : null);
    const currentPrice = auction.current_price ?? auction.start_price;
    const buyNowPrice = auction.buy_now_price;
    const createdDate = new Date(auction.created_at).toLocaleDateString();
    const timeStatus = getAuctionTimeStatus(auction);
    const timeStatusColor = getAuctionTimeStatusColor(auction);

    return (
      <Paper
        radius="xl"
        shadow="sm"
        p="lg"
        bg="#f8f9fa"
        withBorder
        style={{
          borderColor: 'var(--mantine-color-gray-3)',
          transition: 'transform 160ms ease, box-shadow 160ms ease',
          transform: hovered ? 'translateY(-4px)' : undefined,
          boxShadow: hovered ? '0 24px 50px -28px rgba(15, 23, 42, 0.45)' : undefined,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Stack gap="md" style={{ height: '100%' }}>
          <Box
            h={180}
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              backgroundColor: 'var(--mantine-color-gray-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {imageSource ? (
              <Image
                src={imageSource}
                alt={product?.name ?? `Auction #${auction.id}`}
                w="100%"
                h="100%"
                fit="cover"
              />
            ) : (
              <IconPackage size={44} color="var(--mantine-color-gray-5)" />
            )}
          </Box>

          <Stack gap={10} style={{ flex: 1 }}>
            <Group gap="xs">
              {product?.condition && (
                <Badge
                  radius="xl"
                  size="sm"
                  variant="dot"
                  color="gray"
                  style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
                >
                  {product.condition.toUpperCase()}
                </Badge>
              )}
              <Badge
                radius="xl"
                size="sm"
                variant="light"
                color={getStatusColor(auction.status)}
                style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
              >
                {auction.status}
              </Badge>
            </Group>

            <Stack gap={6} style={{ flex: 1, minHeight: rem(80) }}>
              <Text fw={600} size="md" lineClamp={2} style={{ lineHeight: 1.3 }}>
                {product?.name ?? `Auction #${auction.id}`}
              </Text>
              <Group gap="sm" align="flex-end">
                <Text fw={700} size="xl" c="orange" style={{ letterSpacing: '-0.01em' }}>
                  {formatCurrency(currentPrice)}
                </Text>
                <Text size="sm" c="dimmed">
                  Start {formatCurrency(auction.start_price)}
                </Text>
              </Group>
            </Stack>

            <Stack gap={6}>
              {buyNowPrice !== null && (
                <Text size="sm" c="green" fw={600}>
                  Buy now {formatCurrency(buyNowPrice)}
                </Text>
              )}
              <Group gap={6}>
                <Text size="xs" c="dimmed">
                  Auction #{auction.id}
                </Text>
                <Divider orientation="vertical" />
                <Text size="xs" c="dimmed">
                  Created {createdDate}
                </Text>
              </Group>
            </Stack>
          </Stack>

          <Divider />

          <Group gap="lg" align="flex-start" wrap="wrap">
            <Stack gap={2} style={{ minWidth: 140 }}>
              <Text size="xs" c="dimmed">
                Start Time
              </Text>
              <Text size="sm">{formatDate(auction.start_time)}</Text>
            </Stack>
            <Stack gap={2} style={{ minWidth: 140 }}>
              <Text size="xs" c="dimmed">
                End Time
              </Text>
              <Text size="sm">{formatDate(auction.end_time)}</Text>
            </Stack>
            {buyNowPrice !== null && (
              <Stack gap={2}>
                <Text size="xs" c="dimmed">
                  Buy Now
                </Text>
                <Text size="sm" fw={600} c="green">
                  {formatCurrency(buyNowPrice)}
                </Text>
              </Stack>
            )}
          </Group>

          <Group justify="space-between" align="center" mt="auto">
            <Badge radius="xl" variant="light" color={timeStatusColor}>
              {timeStatus}
            </Badge>
            <Button
              variant="light"
              color="orange"
              size="sm"
              leftSection={<IconEye size={16} />}
              onClick={() => navigate(`/auction/${auction.id}`)}
            >
              View Details
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  };

  const mainImage = selectedProduct?.image_url || (selectedProduct?.image_gallery && selectedProduct.image_gallery[0]) || null;

  return (
    <>
      <Container size="xl" py="md" px="xl">
        {/* Header Row */}
        <Group justify="space-between" mb="md">
          <Title order={2} fw={700}>My Auctions</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => handleOpenModal()}
            color="orange"
            size="md"
          >
            Create Auction
          </Button>
        </Group>

        {/* Toolbar Section */}
        <Paper
          shadow="xs"
          radius={12}
          p="md"
          mb="lg"
          withBorder
          style={{ borderColor: '#eee', backgroundColor: '#fff' }}
        >
          <Flex gap="sm" align="center" wrap="wrap">
            <TextInput
              placeholder="Search auctions..."
              leftSection={<IconSearch size={18} stroke={1.6} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              size="md"
              radius="md"
              style={{ flex: '1 1 240px', minWidth: 200 }}
              styles={{
                input: {
                  borderColor: '#eee',
                  backgroundColor: '#fff',
                },
              }}
            />

            <FilterChip label="Status">
              <Select
                variant="unstyled"
                placeholder="All"
                data={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'active', label: 'Active' },
                  { value: 'ended', label: 'Ended' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'sold', label: 'Sold' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
                rightSection={<IconChevronDown size={14} stroke={1.5} />}
                rightSectionWidth={18}
                styles={{
                  input: {
                    padding: '2px 0',
                    fontSize: '0.875rem',
                    color: '#4b5563',
                  },
                  dropdown: { borderRadius: 12 },
                  option: { padding: '6px 10px' },
                }}
              />
            </FilterChip>

            <FilterChip label="Sort">
              <Select
                variant="unstyled"
                placeholder="Newest"
                data={['Newest', 'Oldest', 'Price: Low→High', 'Price: High→Low']}
                value={sortBy}
                onChange={setSortBy}
                rightSection={<IconChevronDown size={14} stroke={1.5} />}
                rightSectionWidth={18}
                styles={{
                  input: {
                    padding: '2px 0',
                    fontSize: '0.875rem',
                    color: '#4b5563',
                  },
                  dropdown: { borderRadius: 12 },
                  option: { padding: '6px 10px' },
                }}
              />
            </FilterChip>

            {hasActiveFilters && (
              <Button
                variant="subtle"
                size="sm"
                leftSection={<IconFilterOff size={16} />}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            )}
          </Flex>
        </Paper>

        {/* Main Content Area */}
        <Box>
          {loading ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {Array.from({ length: 6 }).map((_, index) => (
                <Paper key={index} radius="xl" p="lg" bg="#f8f9fa" shadow="xs" withBorder>
                  <Skeleton height={180} radius="lg" />
                  <Stack gap="sm" mt="md">
                    <Skeleton height={16} width="30%" />
                    <Skeleton height={24} width="60%" />
                    <Skeleton height={16} width="50%" />
                    <Skeleton height={12} width="70%" />
                    <Skeleton height={36} />
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          ) : error ? (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error loading auctions">
              {error}
            </Alert>
          ) : filteredAuctions.length === 0 && auctions.length > 0 ? (
            <Stack align="center" py="xl" gap="md">
              <IconGavel size={64} stroke={1.5} color="var(--mantine-color-gray-5)" />
              <Stack align="center" gap="xs">
                <Text fw={600} size="lg">No auctions match your filters</Text>
                <Text c="dimmed" size="sm" ta="center" maw={400}>
                  Try adjusting your search or filter criteria.
                </Text>
              </Stack>
              {hasActiveFilters && (
                <Button 
                  variant="subtle"
                  onClick={handleResetFilters}
                  leftSection={<IconFilterOff size={16} />}
                >
                  Reset Filters
                </Button>
              )}
            </Stack>
          ) : auctions.length === 0 ? (
            <Stack align="center" py="xl" gap="md">
              <IconGavel size={64} stroke={1.5} color="var(--mantine-color-gray-5)" />
              <Stack align="center" gap="xs">
                <Text fw={600} size="lg">No auctions yet</Text>
                <Text c="dimmed" size="sm" ta="center" maw={400}>
                  Start selling by creating your first auction. You'll need to have a product first before creating an auction.
                </Text>
              </Stack>
              <Button 
                leftSection={<IconPlus size={18} />}
                onClick={() => handleOpenModal()} 
                color="orange"
                size="md"
                mt="md"
              >
                Create Auction
              </Button>
            </Stack>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, xl: 4 }} spacing="lg">
              {filteredAuctions.map((auction) => (
                <AuctionCard auction={auction} key={auction.id} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Container>

      {/* Create Auction Modal */}
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title="Create New Auction"
        size="xl"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* Product Selection */}
            {loadingProducts ? (
              <Skeleton height={36} />
            ) : (
              <Select
                label="Select Product"
                placeholder="Choose a product to create auction for"
                required
                data={productOptions}
                searchable
                value={form.values.product_id?.toString() || null}
                onChange={handleProductSelect}
              />
            )}

            {loadingProduct && selectedProduct && (
              <Skeleton height={200} />
            )}

            {selectedProduct && !loadingProduct && (
              <Paper withBorder radius="md" p="md" bg="gray.0">
                <Stack gap="sm">
                  {mainImage && (
                    <Image
                      src={mainImage}
                      alt={selectedProduct.name}
                      radius="md"
                      h={450}
                      fit="cover"
                    />
                  )}
                  <div>
                    <Text fw={600} size="lg" mb="xs">{selectedProduct.name}</Text>
                    {selectedProduct.description && (
                      <Text size="sm" c="dimmed" mb="xs" lineClamp={2}>
                        {selectedProduct.description}
                      </Text>
                    )}
                    <Group gap="xs" mt="sm">
                      <Badge variant="light" color="blue">
                        Base Price: ${selectedProduct.base_price.toFixed(2)}
                      </Badge>
                      <Badge variant="light" color="gray">
                        {selectedProduct.condition}
                      </Badge>
                    </Group>
                  </div>
                  <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                    Product information is read-only
                  </Alert>
                </Stack>
              </Paper>
            )}

            {!selectedProduct && !loadingProduct && form.values.product_id && (
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                Product not found
              </Alert>
            )}

            {/* Auction Details */}
            {selectedProduct && (
              <>
                <NumberInput
                  label="Start Price"
                  placeholder="Enter starting bid price"
                  required
                  min={0}
                  decimalScale={2}
                  prefix="$"
                  description={`Product base price: $${selectedProduct.base_price.toFixed(2)}`}
                  {...form.getInputProps('start_price')}
                />
                <NumberInput
                  label="Buy Now Price (Optional)"
                  placeholder="Enter buy now price"
                  min={0}
                  decimalScale={2}
                  prefix="$"
                  description="Allow buyers to purchase immediately at this price"
                  {...form.getInputProps('buy_now_price')}
                />
                <DateTimePicker
                  label="Start Time"
                  placeholder="Select auction start time"
                  value={form.values.start_time}
                  onChange={(value) => form.setFieldValue('start_time', value as Date | null)}
                  minDate={new Date()}
                />
                <DateTimePicker
                  label="End Time"
                  placeholder="Select auction end time"
                  required
                  value={form.values.end_time}
                  onChange={(value) => form.setFieldValue('end_time', value as Date | null)}
                  minDate={form.values.start_time || new Date()}
                  error={form.errors.end_time}
                />
                {form.values.start_price && form.values.end_time && (
                  <Alert icon={<IconInfoCircle size={16} />} color="green" variant="light">
                    Auction will run from{' '}
                    {form.values.start_time?.toLocaleString()} to{' '}
                    {form.values.end_time?.toLocaleString()}
                  </Alert>
                )}
              </>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={submitting} 
                color="orange"
                disabled={!selectedProduct}
              >
                Create Auction
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Error Modal - No Products */}
      <Modal
        opened={errorModalOpened}
        onClose={closeErrorModal}
        title="No Products Available"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            <Text fw={600} mb="xs">You need to create a product first!</Text>
            <Text size="sm">
              Please create a product first, then you can create an auction for it
            </Text>
          </Alert>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeErrorModal}>
              Cancel
            </Button>
            <Button 
              color="orange" 
              onClick={() => {
                closeErrorModal();
                navigate('/seller/products');
              }}
            >
              Go to Products
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
