import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  Group,
  Text,
  Badge,
  ActionIcon,
  Paper,
  Stack,
  Modal,
  NumberInput,
  Select,
  Image,
  Alert,
  Skeleton,
  Card,
  TextInput,
  Box,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEye, IconInfoCircle, IconAlertCircle, IconGavel, IconSearch, IconFilterOff } from '@tabler/icons-react';
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

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/auctions');
      const fetchedAuctions = response.data || [];
      setAuctions(fetchedAuctions);
      setFilteredAuctions(fetchedAuctions);
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
      const response = await api.get(`/products/${id}`);
      const productData = response.data;
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

  const handleOpenModal = async () => {
    // Fetch products first
    try {
      setLoadingProducts(true);
      // TODO: Replace 1 with actual seller_id from auth
      const response = await api.get('/products/seller/1');
      const fetchedProducts = response.data;
      setProducts(fetchedProducts);
      
      // Check if there are any products
      if (fetchedProducts.length === 0) {
        openErrorModal();
      } else {
        open();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load products',
        color: 'red',
      });
    } finally {
      setLoadingProducts(false);
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
    const id = parseInt(productId);
    form.setFieldValue('product_id', id);
    fetchProduct(id);
  };

  const handleSubmit = async (values: AuctionFormValues) => {
    if (!values.product_id) return;

    try {
      setSubmitting(true);

      const payload = {
        product_id: values.product_id,
        seller_id: 1, // TODO: Get from auth context
        start_price: typeof values.start_price === 'number' 
          ? values.start_price 
          : parseFloat(values.start_price as string),
        buy_now_price: values.buy_now_price 
          ? (typeof values.buy_now_price === 'number' 
              ? values.buy_now_price 
              : parseFloat(values.buy_now_price as string))
          : null,
        start_time: values.start_time?.toISOString() || new Date().toISOString(),
        end_time: values.end_time?.toISOString() || '',
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

  const productOptions = products.map((product) => ({
    value: product.id.toString(),
    label: `${product.name} - $${product.base_price.toFixed(2)}`,
  }));

  const mainImage = selectedProduct?.image_url || (selectedProduct?.image_gallery && selectedProduct.image_gallery[0]) || null;

  return (
    <>
      <Container size="xl" py="md" px="xl">
        {/* Header Row */}
        <Group justify="space-between" mb="md">
          <Title order={2} fw={700}>My Auctions</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={handleOpenModal}
            color="orange"
            size="md"
          >
            Create Auction
          </Button>
        </Group>

        {/* Toolbar Section */}
        <Paper bg="#f9fafb" shadow="xs" radius="md" p="md" mb="lg">
          <Group gap="md" wrap="wrap">
            <TextInput
              placeholder="Search auctions..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <Select
              placeholder="Filter by status"
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
              style={{ minWidth: 180 }}
            />
            <Select
              placeholder="Sort by"
              data={['Newest', 'Oldest', 'Price: Low→High', 'Price: High→Low']}
              value={sortBy}
              onChange={setSortBy}
              style={{ minWidth: 180 }}
            />
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
          </Group>
        </Paper>

        {/* Main Content Area */}
        <Box>
          {loading ? (
            <Stack gap="md">
              {Array.from({ length: 3 }).map((_, i) => (
                <Paper key={i} bg="white" shadow="xs" radius="md" p="md">
                  <Group gap="md" justify="space-between">
                    <Skeleton height={24} width={100} />
                    <Group gap="lg">
                      <Stack gap={2}>
                        <Skeleton height={12} width={60} />
                        <Skeleton height={20} width={80} />
                      </Stack>
                      <Stack gap={2}>
                        <Skeleton height={12} width={60} />
                        <Skeleton height={20} width={80} />
                      </Stack>
                      <Stack gap={2}>
                        <Skeleton height={12} width={60} />
                        <Skeleton height={20} width={80} />
                      </Stack>
                    </Group>
                    <Skeleton height={28} width={80} />
                    <Skeleton height={32} width={32} />
                  </Group>
                </Paper>
              ))}
            </Stack>
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
                onClick={handleOpenModal} 
                color="orange"
                size="md"
                mt="md"
              >
                Create Auction
              </Button>
            </Stack>
          ) : (
            <Stack gap="md">
              {filteredAuctions.map((auction) => (
                <Card key={auction.id} withBorder radius="md" p="md" style={{ transition: 'all 0.2s' }}>
                  <Group gap="md" align="flex-start" wrap="nowrap">
                    {/* Auction Info */}
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={4}>
                          <Text fw={600} size="lg">Auction #{auction.id}</Text>
                          <Group gap="lg">
                            <Stack gap={2}>
                              <Text size="xs" c="dimmed">Start Price</Text>
                              <Text fw={600} size="md">${auction.start_price.toFixed(2)}</Text>
                            </Stack>
                            <Stack gap={2}>
                              <Text size="xs" c="dimmed">Current Price</Text>
                              <Text fw={700} size="md" c="orange">${auction.current_price.toFixed(2)}</Text>
                            </Stack>
                            {auction.buy_now_price && (
                              <Stack gap={2}>
                                <Text size="xs" c="dimmed">Buy Now</Text>
                                <Text fw={600} size="md" c="green">${auction.buy_now_price.toFixed(2)}</Text>
                              </Stack>
                            )}
                          </Group>
                        </Stack>
                        <Badge variant="light" color={getStatusColor(auction.status)} size="lg">
                          {auction.status}
                        </Badge>
                      </Group>
                      <Group gap="md" mt="xs">
                        <Stack gap={2}>
                          <Text size="xs" c="dimmed">Start Time</Text>
                          <Text size="sm">{formatDate(auction.start_time)}</Text>
                        </Stack>
                        <Stack gap={2}>
                          <Text size="xs" c="dimmed">End Time</Text>
                          <Text size="sm">{formatDate(auction.end_time)}</Text>
                        </Stack>
                      </Group>
                    </Stack>

                    {/* Actions */}
                    <Group gap="xs" align="flex-start">
                      <ActionIcon 
                        variant="light" 
                        color="blue" 
                        aria-label="View" 
                        size="lg"
                        onClick={() => navigate(`/auction/${auction.id}`)}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
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
                      h={120}
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
