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
  Image,
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  TagsInput,
  FileButton,
  Grid,
  Skeleton,
  Alert,
  Card,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus, IconEye, IconUpload, IconX, IconPackage, IconAlertCircle, IconSearch, IconGavel, IconFilterOff } from '@tabler/icons-react';
import api from '../../utils/api';

type Product = {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  condition: string;
  status: string;
  created_at: string;
  category_id: number | null;
};

type Category = {
  id: number;
  name: string;
  slug: string | null;
};

type ProductFormValues = {
  name: string;
  description: string;
  category_id: number | null;
  condition: string;
  base_price: number | '';
  image_gallery: string[];
  tags: string[];
};

export default function SellerProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>('Newest');

  const form = useForm<ProductFormValues>({
    initialValues: {
      name: '',
      description: '',
      category_id: null,
      condition: 'used',
      base_price: '',
      image_gallery: [],
      tags: [],
    },
    validate: {
      name: (value) => (value.trim().length < 1 ? 'Name is required' : null),
      base_price: (value) => {
        if (value === '' || value === null) return 'Base price is required';
        if (typeof value === 'number' && value <= 0) return 'Base price must be greater than 0';
        return null;
      },
    },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace 1 with actual seller_id from auth
      const response = await api.get('/products/seller/1');
      const fetchedProducts = response.data || [];
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch products';
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

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category_id?.toString() === selectedCategory);
    }

    // Apply sorting
    if (sortBy === 'Newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'Oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'Price: Low→High') {
      filtered.sort((a, b) => a.base_price - b.base_price);
    } else if (sortBy === 'Price: High→Low') {
      filtered.sort((a, b) => b.base_price - a.base_price);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('Newest');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== null || sortBy !== 'Newest';

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load categories',
        color: 'red',
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleOpenModal = () => {
    fetchCategories();
    open();
  };

  const handleCloseModal = () => {
    close();
    form.reset();
    setImagePreviews([]);
  };

  const handleImageUpload = (files: File[]) => {
    if (!files || files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      setSubmitting(true);

      const image_url = imagePreviews[0] || null;
      const image_gallery = imagePreviews;

      const payload = {
        seller_id: 1, // TODO: Get from auth context
        name: values.name.trim(),
        description: values.description.trim() || null,
        category_id: values.category_id || null,
        condition: values.condition,
        base_price: typeof values.base_price === 'number' ? values.base_price : parseFloat(values.base_price as string),
        image_url: image_url,
        image_gallery: image_gallery.length > 0 ? image_gallery : null,
        tags: values.tags.length > 0 ? values.tags : null,
        status: 'draft',
      };

      await api.post('/products', payload);
      
      notifications.show({
        title: 'Success',
        message: 'Product created successfully!',
        color: 'green',
      });

      handleCloseModal();
      fetchProducts();

      // Navigate to auctions page - user can create auction from there
      navigate('/seller/auctions');
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to create product',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/${id}`);
      notifications.show({
        title: 'Success',
        message: 'Product deleted successfully',
        color: 'green',
      });
      fetchProducts();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to delete product',
        color: 'red',
      });
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id.toString(),
    label: cat.name,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'draft':
        return 'gray';
      case 'in_auction':
        return 'orange';
      case 'sold':
        return 'red';
      default:
        return 'blue';
    }
  };

  const handleStartAuction = (productId: number) => {
    navigate(`/seller/auctions?product_id=${productId}`);
  };

  return (
    <>
      <Container size="xl" py="md" px="xl">
        {/* Header Row */}
        <Group justify="space-between" mb="md">
          <Title order={2} fw={700}>My Products</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={handleOpenModal}
            color="orange"
            size="md"
          >
            Create Product
          </Button>
        </Group>

        {/* Toolbar Section */}
        <Paper bg="#f9fafb" shadow="xs" radius="md" p="md" mb="lg">
          <Group gap="md" wrap="wrap">
            <TextInput
              placeholder="Search products..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <Select
              placeholder="Filter by category"
              data={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              clearable
              style={{ minWidth: 200 }}
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
                  <Group gap="md">
                    <Skeleton height={100} width={100} radius="md" />
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Skeleton height={24} width="60%" />
                      <Skeleton height={20} width="40%" />
                      <Skeleton height={16} width="30%" />
                    </Stack>
                    <Skeleton height={36} width={120} />
                  </Group>
                </Paper>
              ))}
            </Stack>
          ) : error ? (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error loading products">
              {error}
            </Alert>
          ) : filteredProducts.length === 0 && products.length > 0 ? (
            <Stack align="center" py="xl" gap="md">
              <IconPackage size={64} stroke={1.5} color="var(--mantine-color-gray-5)" />
              <Stack align="center" gap="xs">
                <Text fw={600} size="lg">No products match your filters</Text>
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
          ) : products.length === 0 ? (
            <Stack align="center" py="xl" gap="md">
              <IconPackage size={64} stroke={1.5} color="var(--mantine-color-gray-5)" />
              <Stack align="center" gap="xs">
                <Text fw={600} size="lg">No products yet</Text>
                <Text c="dimmed" size="sm" ta="center" maw={400}>
                  Get started by creating your first product. Once you have products, you can create auctions for them.
                </Text>
              </Stack>
              <Button 
                leftSection={<IconPlus size={18} />}
                onClick={handleOpenModal} 
                color="orange"
                size="md"
                mt="md"
              >
                Create Product
              </Button>
            </Stack>
          ) : (
            <Stack gap="md">
              {filteredProducts.map((product) => (
                <Card key={product.id} bg="white" shadow="xs" radius="md" p="md" style={{ transition: 'all 0.2s' }}>
                  <Group gap="md" align="flex-start" wrap="nowrap">
                    {/* Product Image */}
                    <Box>
                      {product.image_url ? (
                        <Image 
                          src={product.image_url} 
                          alt={product.name} 
                          w={100} 
                          h={100} 
                          fit="cover" 
                          radius="md"
                        />
                      ) : (
                        <Box
                          w={100}
                          h={100}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'var(--mantine-color-gray-1)',
                            borderRadius: 'var(--mantine-radius-md)',
                          }}
                        >
                          <IconPackage size={40} color="var(--mantine-color-gray-5)" />
                        </Box>
                      )}
                    </Box>

                    {/* Product Info */}
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={4}>
                          <Text fw={600} size="lg">{product.name}</Text>
                          <Text fw={700} size="xl" c="orange">
                            ${product.base_price.toFixed(2)}
                          </Text>
                        </Stack>
                        <Group gap="xs">
                          <Badge variant="light">{product.condition}</Badge>
                          <Badge variant="light" color={getStatusColor(product.status)}>
                            {product.status}
                          </Badge>
                        </Group>
                      </Group>
                      {product.description && (
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          {product.description}
                        </Text>
                      )}
                      <Text size="xs" c="dimmed">
                        Created: {new Date(product.created_at).toLocaleDateString()}
                      </Text>
                    </Stack>

                    {/* Actions */}
                    <Group gap="xs" align="flex-start">
                      <Button
                        variant="light"
                        color="orange"
                        size="sm"
                        leftSection={<IconGavel size={16} />}
                        onClick={() => handleStartAuction(product.id)}
                      >
                        Start Auction
                      </Button>
                      <ActionIcon variant="light" color="blue" aria-label="View" size="lg">
                        <IconEye size={18} />
                      </ActionIcon>
                      <ActionIcon variant="light" color="orange" aria-label="Edit" size="lg">
                        <IconEdit size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDelete(product.id)}
                        aria-label="Delete"
                        size="lg"
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Container>

      {/* Create Product Modal */}
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title="Create New Product"
        size="xl"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Product Name"
                  placeholder="Enter product name"
                  required
                  {...form.getInputProps('name')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <NumberInput
                  label="Base Price"
                  placeholder="Enter base price"
                  required
                  min={0}
                  decimalScale={2}
                  prefix="$"
                  {...form.getInputProps('base_price')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Description"
                  placeholder="Enter product description"
                  rows={3}
                  {...form.getInputProps('description')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                {loadingCategories ? (
                  <TextInput label="Category" placeholder="Loading categories..." disabled />
                ) : (
                  <Select
                    label="Category"
                    placeholder="Select a category"
                    data={categoryOptions}
                    searchable
                    clearable
                    value={form.values.category_id?.toString() || null}
                    onChange={(value) =>
                      form.setFieldValue('category_id', value ? parseInt(value) : null)
                    }
                  />
                )}
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Condition"
                  placeholder="Select condition"
                  required
                  data={[
                    { value: 'new', label: 'New' },
                    { value: 'used', label: 'Used' },
                    { value: 'refurbished', label: 'Refurbished' },
                  ]}
                  {...form.getInputProps('condition')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TagsInput
                  label="Tags"
                  placeholder="Add tags (press Enter to add)"
                  {...form.getInputProps('tags')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Stack gap="sm">
                  <Group>
                    <FileButton
                      onChange={handleImageUpload}
                      accept="image/png,image/jpeg,image/jpg"
                      multiple
                    >
                      {(props) => (
                        <Button leftSection={<IconUpload size={18} />} {...props} variant="light">
                          Upload Images
                        </Button>
                      )}
                    </FileButton>
                    <Text size="sm" c="dimmed">
                      Upload product images (multiple allowed)
                    </Text>
                  </Group>

                  {imagePreviews.length > 0 && (
                    <Group gap="sm" mt="md">
                      {imagePreviews.map((preview, index) => (
                        <Paper key={index} withBorder radius="md" p="xs" pos="relative" style={{ width: 100, height: 100 }}>
                          <Image src={preview} alt={`Preview ${index + 1}`} h={70} fit="cover" radius="sm" />
                          <Button
                            size="xs"
                            color="red"
                            variant="filled"
                            pos="absolute"
                            top={2}
                            right={2}
                            onClick={() => removeImage(index)}
                            style={{ minWidth: 'auto', width: 20, height: 20, padding: 0 }}
                          >
                            <IconX size={12} />
                          </Button>
                          <Badge size="xs" variant="light" pos="absolute" bottom={2} left={2}>
                            {index === 0 ? 'Main' : index + 1}
                          </Badge>
                        </Paper>
                      ))}
                    </Group>
                  )}
                </Stack>
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} color="orange">
                Create Product & Continue to Auction
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
