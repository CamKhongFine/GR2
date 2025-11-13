import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
  Box,
  Divider,
  SimpleGrid,
  rem,
  Flex,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconEye,
  IconUpload,
  IconX,
  IconPackage,
  IconAlertCircle,
  IconSearch,
  IconGavel,
  IconFilterOff,
  IconChevronDown,
} from '@tabler/icons-react';
import api from '../../utils/api';

type Product = {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  image_gallery: string[];
  condition: string;
  status: string;
  created_at: string;
  category_id: number | null;
  tags: string[];
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

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function SellerProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState<number>(0);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [viewingImageIndex, setViewingImageIndex] = useState(0);
  const [userInfo] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('user_info') || 'null');
    } catch {
      return null;
    }
  });

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>('Newest');
  const [conditionFilter, setConditionFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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
    if (userInfo?.id) {
      fetchProducts();
    }
  }, [userInfo?.id]);

  useEffect(() => {
    if (viewingProduct) {
      setViewingImageIndex(0);
    }
  }, [viewingProduct]);

  const normalizeProduct = (product: any): Product => ({
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
    tags: Array.isArray(product.tags) ? product.tags : product.tags ? [product.tags] : [],
    status: product.status ?? 'draft',
  });

  const fetchProducts = async () => {
    if (!userInfo?.id) return;
    try {
      setLoading(true);
      setError(null);
      const sellerId = userInfo.id;
      const response = await api.get(`/products/seller/${sellerId}`, {
        timeout: 10000,
      });
      const fetchedProducts = Array.isArray(response.data) ? response.data : [];
      const normalizedProducts = fetchedProducts.map(normalizeProduct);
      setProducts(normalizedProducts);
      setFilteredProducts(normalizedProducts);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch products';
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
      const lower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(lower) ||
          product.description?.toLowerCase().includes(lower) ||
          product.tags.some((tag) => tag.toLowerCase().includes(lower)),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category_id?.toString() === selectedCategory);
    }

    if (conditionFilter) {
      filtered = filtered.filter((product) => product.condition === conditionFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

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
  }, [products, searchQuery, selectedCategory, sortBy, conditionFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('Newest');
    setConditionFilter(null);
    setStatusFilter(null);
  };

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        value: cat.id.toString(),
        label: cat.name,
      })),
    [categories],
  );

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

  const handleOpenModal = () => {
    setIsEditMode(false);
    setActiveProduct(null);
    setExistingImageUrls([]);
    setImagePreviews([]);
    setImageFiles([]);
    setThumbnailIndex(0);
    form.reset();
    fetchCategories();
    open();
  };

  const handleCloseModal = () => {
    close();
    form.reset();
    setImagePreviews([]);
    setImageFiles([]);
    setThumbnailIndex(0);
    setIsEditMode(false);
    setActiveProduct(null);
    setExistingImageUrls([]);
    setUploadingImages(false);
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    openViewModal();
  };

  const handleCloseViewModal = () => {
    setViewingProduct(null);
    closeViewModal();
  };

  const handleEditProduct = (product: Product) => {
    handleCloseViewModal();
    setIsEditMode(true);
    setActiveProduct(product);
    const existingImages =
      product.image_gallery && product.image_gallery.length > 0
        ? product.image_gallery
        : product.image_url
          ? [product.image_url]
          : [];
    setExistingImageUrls(existingImages);
    form.setValues({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id,
      condition: product.condition,
      base_price: product.base_price,
      image_gallery: existingImages,
      tags: product.tags || [],
    });
    setImagePreviews([]);
    setImageFiles([]);
    setThumbnailIndex(0);
    fetchCategories();
    open();
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load categories',
        color: 'red',
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleImageUpload = (files: File[]) => {
    if (!files || files.length === 0) return;

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Create previews
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
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    if (thumbnailIndex >= index && thumbnailIndex > 0) {
      setThumbnailIndex(thumbnailIndex - 1);
    } else if (thumbnailIndex >= index && thumbnailIndex === 0 && imagePreviews.length > 1) {
      setThumbnailIndex(0);
    }
  };

  const uploadImagesToMinIO = async (files: File[]): Promise<string[]> => {
    const objectNames: string[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products');

        const response = await api.post('/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        objectNames.push(response.data.object_name);
      } catch (err: any) {
        console.error('Error uploading image:', err);
        notifications.show({
          title: 'Upload Error',
          message: `Failed to upload ${file.name}: ${err.response?.data?.detail || 'Unknown error'}`,
          color: 'red',
        });
        throw err;
      }
    }

    return objectNames;
  };

  const handleStartAuction = (productId: number) => {
    navigate(`/seller/auctions?product_id=${productId}`);
  };

  const handleSubmit = async (values: ProductFormValues) => {
    const isEditing = isEditMode && !!activeProduct;

    try {
      setSubmitting(true);
      let uploadedObjectNames: string[] = [];
      if (!isEditing) {
        setUploadingImages(true);
        if (imageFiles.length > 0) {
          try {
            uploadedObjectNames = await uploadImagesToMinIO(imageFiles);
          } catch (err) {
            setUploadingImages(false);
            setSubmitting(false);
            return;
          }
        }
        setUploadingImages(false);
      }

      const basePrice =
        typeof values.base_price === 'number'
          ? values.base_price
          : parseFloat(values.base_price as string);

      const basePayload: Record<string, any> = {
        seller_id: userInfo?.id || 1,
        name: values.name.trim(),
        description: values.description.trim() || null,
        category_id: values.category_id || null,
        condition: values.condition,
        base_price: basePrice,
        tags: values.tags.length > 0 ? values.tags : null,
      };

      if (isEditing && activeProduct) {
        const updatePayload: Record<string, any> = {
          ...basePayload,
          status: activeProduct.status,
        };

        if (existingImageUrls.length > 0) {
          updatePayload.image_gallery = existingImageUrls;
          updatePayload.image_url = existingImageUrls[0];
        }

        await api.put(`/products/${activeProduct.id}`, updatePayload);

        notifications.show({
          title: 'Success',
          message: 'Product updated successfully!',
          color: 'green',
        });
      } else {
        const createPayload = {
          ...basePayload,
          image_object_names: uploadedObjectNames.length > 0 ? uploadedObjectNames : null,
          thumbnail_index: thumbnailIndex,
          status: 'draft',
        };

        await api.post('/products', createPayload);

        notifications.show({
          title: 'Success',
          message: 'Product created successfully!',
          color: 'green',
        });

        navigate('/seller/auctions');
      }

      handleCloseModal();
      fetchProducts();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message:
          err.response?.data?.detail ||
          (isEditing ? 'Failed to update product' : 'Failed to create product'),
        color: 'red',
      });
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
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
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail || 'Failed to delete product',
        color: 'red',
      });
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== null ||
    sortBy !== 'Newest' ||
    conditionFilter !== null ||
    statusFilter !== null;

  const ProductCard = ({ product }: { product: Product }) => {
    const createdDate = new Date(product.created_at).toLocaleDateString();
    const mainImage =
      product.image_url ||
      (product.image_gallery && product.image_gallery.length > 0
        ? product.image_gallery[0]
        : null);
    const [hovered, setHovered] = useState(false);

    return (
      <Paper
        radius="xl"
        shadow="sm"
        p="lg"
        bg="#f8f9fa"
        withBorder
        key={product.id}
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
            {mainImage ? (
              <Image src={mainImage} alt={product.name} w="100%" h="100%" fit="cover" />
            ) : (
              <IconPackage size={40} color="var(--mantine-color-gray-5)" />
            )}
          </Box>

          <Stack gap={10} style={{ flex: 1 }}>
            <Group gap="xs">
              <Badge
                radius="xl"
                size="sm"
                variant="dot"
                color="gray"
                style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
              >
                {product.condition.toUpperCase()}
              </Badge>
              <Badge
                radius="xl"
                size="sm"
                variant="light"
                color={getStatusColor(product.status)}
                style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
              >
                {product.status}
              </Badge>
            </Group>

            <Stack gap={6} style={{ flex: 1, minHeight: rem(80) }}>
              <Text fw={600} size="md" lineClamp={2} style={{ lineHeight: 1.3 }}>
                {product.name}
              </Text>
              <Text fw={700} size="xl" c="orange" style={{ letterSpacing: '-0.01em' }}>
                {formatCurrency(product.base_price)}
              </Text>
            </Stack>

            <Stack gap={6}>
              {product.description && (
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {product.description}
                </Text>
              )}
              <Group gap={6}>
                <Text size="xs" c="dimmed">
                  Created {createdDate}
                </Text>
                <Divider orientation="vertical" />
                <Text size="xs" c="dimmed">
                  ID #{product.id}
                </Text>
              </Group>
            </Stack>
          </Stack>

          <Stack gap="sm">
            <Group gap={6}>
              <ActionIcon
                variant="subtle"
                color="gray"
                radius="xl"
                size="lg"
                aria-label="View product"
                onClick={() => handleViewProduct(product)}
                style={{ transition: 'transform 140ms ease, box-shadow 140ms ease' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = 'translateY(-2px)';
                  event.currentTarget.style.boxShadow = '0 10px 20px -12px rgba(15, 23, 42, 0.35)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = 'none';
                  event.currentTarget.style.boxShadow = 'none';
                }}
              >
                <IconEye size={18} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="orange"
                radius="xl"
                size="lg"
                aria-label="Edit product"
                onClick={() => handleEditProduct(product)}
                style={{ transition: 'transform 140ms ease, box-shadow 140ms ease' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = 'translateY(-2px)';
                  event.currentTarget.style.boxShadow = '0 10px 20px -12px rgba(15, 23, 42, 0.35)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = 'none';
                  event.currentTarget.style.boxShadow = 'none';
                }}
              >
                <IconEdit size={18} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                radius="xl"
                size="lg"
                aria-label="Delete product"
                onClick={() => handleDelete(product.id)}
                style={{ transition: 'transform 140ms ease, box-shadow 140ms ease' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = 'translateY(-2px)';
                  event.currentTarget.style.boxShadow = '0 10px 20px -12px rgba(15, 23, 42, 0.35)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = 'none';
                  event.currentTarget.style.boxShadow = 'none';
                }}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Group>

            <Button
              variant="light"
              color="orange"
              size="compact-md"
              radius="md"
              leftSection={<IconGavel size={16} />}
              onClick={() => handleStartAuction(product.id)}
              justify="center"
              fullWidth
            >
              Start Auction
            </Button>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  const hasProducts = filteredProducts.length > 0;

  return (
    <>
      <Container size="xl" py="md" px="xl">
        <Group justify="space-between" mb="lg">
          <Title order={2} fw={700}>
            My Products
          </Title>
          <Button leftSection={<IconPlus size={18} />} onClick={handleOpenModal} color="orange" size="md">
            Create Product
          </Button>
        </Group>

        <Paper
          shadow="xs"
          radius={12}
          p="md"
          mb="xl"
          withBorder
          style={{ borderColor: '#eee', backgroundColor: '#fff' }}
        >
          <Flex gap="sm" align="center" wrap="wrap">
            <TextInput
              placeholder="Search products..."
              leftSection={<IconSearch size={18} stroke={1.6} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              size="md"
              radius="md"
              style={{ flex: '1 1 260px', minWidth: 220 }}
              styles={{
                input: {
                  borderColor: '#eee',
                  backgroundColor: '#fff',
                },
              }}
            />

            <FilterChip label="Category">
              <Select
                variant="unstyled"
                placeholder="All"
                data={categoryOptions}
                value={selectedCategory}
                onChange={setSelectedCategory}
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

            <FilterChip label="Condition">
              <Select
                variant="unstyled"
                placeholder="All"
                data={[
                  { value: 'new', label: 'New' },
                  { value: 'used', label: 'Used' },
                  { value: 'refurbished', label: 'Refurbished' },
                ]}
                value={conditionFilter}
                onChange={setConditionFilter}
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

            <FilterChip label="Status">
              <Select
                variant="unstyled"
                placeholder="All"
                data={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'available', label: 'Available' },
                  { value: 'in_auction', label: 'In Auction' },
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

        <Box>
          {loading ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Paper key={idx} radius="xl" p="lg" bg="#f8f9fa" shadow="xs">
                  <Skeleton height={160} radius="lg" />
                  <Stack gap="sm" mt="md">
                    <Skeleton height={16} width="60%" />
                    <Skeleton height={28} width="40%" />
                    <Skeleton height={12} width="80%" />
                    <Group justify="space-between" mt="sm">
                      <Skeleton height={32} width="45%" />
                      <Skeleton height={32} width="32%" />
                    </Group>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          ) : error ? (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error loading products">
              {error}
            </Alert>
          ) : hasProducts ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, xl: 4 }} spacing="lg">
              {filteredProducts.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </SimpleGrid>
          ) : products.length === 0 ? (
            <Stack align="center" py="xl" gap="md">
              <IconPackage size={64} stroke={1.5} color="var(--mantine-color-gray-5)" />
              <Stack align="center" gap="xs">
                <Text fw={600} size="lg">
                  No products yet
                </Text>
                <Text c="dimmed" size="sm" ta="center" maw={400}>
                  Get started by creating your first product. Once you have products, you can create auctions for them.
                </Text>
              </Stack>
              <Button leftSection={<IconPlus size={18} />} onClick={handleOpenModal} color="orange" size="md" mt="md">
                Create Product
              </Button>
            </Stack>
          ) : (
            <Stack align="center" py="xl" gap="md">
              <IconPackage size={64} stroke={1.5} color="var(--mantine-color-gray-5)" />
              <Stack align="center" gap="xs">
                <Text fw={600} size="lg">
                  No products match your filters
                </Text>
                <Text c="dimmed" size="sm" ta="center" maw={400}>
                  Try adjusting your search or filter criteria.
                </Text>
              </Stack>
              <Button variant="subtle" onClick={handleResetFilters} leftSection={<IconFilterOff size={16} />}>
                Reset Filters
              </Button>
            </Stack>
          )}
        </Box>
      </Container>

      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={isEditMode ? 'Edit Product' : 'Create New Product'}
        size="xl"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput label="Product Name" placeholder="Enter product name" required {...form.getInputProps('name')} />
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
                    onChange={(value) => form.setFieldValue('category_id', value ? parseInt(value, 10) : null)}
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

              {!isEditMode && (
                <Grid.Col span={12}>
                  <Stack gap="sm">
                    <Group>
                      <FileButton onChange={handleImageUpload} accept="image/png,image/jpeg,image/jpg" multiple>
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
                      <Stack gap="sm" mt="md">
                        <Text size="sm" fw={500}>
                          Select thumbnail (click to set as main image):
                        </Text>
                        <Group gap="sm">
                          {imagePreviews.map((preview, index) => (
                            <Paper
                              key={index}
                              withBorder
                              radius="md"
                              p="xs"
                              pos="relative"
                              style={{
                                width: 100,
                                height: 100,
                                border: thumbnailIndex === index ? '3px solid #FF7A00' : '1px solid #dee2e6',
                                boxShadow: thumbnailIndex === index ? '0 0 0 2px rgba(255, 122, 0, 0.2)' : 'none',
                                transition: 'transform 140ms ease',
                              }}
                              onMouseEnter={(event) => {
                                event.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(event) => {
                                event.currentTarget.style.transform = 'none';
                              }}
                              onClick={() => setThumbnailIndex(index)}
                            >
                              <Image src={preview} alt={`Preview ${index + 1}`} h={70} fit="cover" radius="sm" />
                              <Button
                                size="xs"
                                color="red"
                                variant="filled"
                                pos="absolute"
                                top={2}
                                right={2}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                style={{ minWidth: 'auto', width: 20, height: 20, padding: 0 }}
                              >
                                <IconX size={12} />
                              </Button>
                              <Badge
                                size="xs"
                                variant={thumbnailIndex === index ? 'filled' : 'light'}
                                color={thumbnailIndex === index ? 'orange' : 'gray'}
                                pos="absolute"
                                bottom={2}
                                left={2}
                              >
                                {thumbnailIndex === index ? 'Thumbnail' : index + 1}
                              </Badge>
                            </Paper>
                          ))}
                        </Group>
                      </Stack>
                    )}
                  </Stack>
                </Grid.Col>
              )}

              {isEditMode && existingImageUrls.length > 0 && (
                <Grid.Col span={12}>
                  <Stack gap="sm">
                    <Text size="sm" fw={500}>
                      Current images
                    </Text>
                    <Group gap="sm">
                      {existingImageUrls.map((url, index) => (
                        <Paper
                          key={index}
                          withBorder
                          radius="md"
                          p="xs"
                          style={{
                            width: 100,
                            height: 100,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Image src={url} alt={`Product image ${index + 1}`} h={88} fit="cover" radius="sm" />
                        </Paper>
                      ))}
                    </Group>
                    <Text size="xs" c="dimmed">
                      Image updates will be supported soon. Current images remain unchanged.
                    </Text>
                  </Stack>
                </Grid.Col>
              )}
            </Grid>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={handleCloseModal} disabled={submitting || uploadingImages}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting || uploadingImages} color="orange" disabled={uploadingImages}>
                {uploadingImages
                  ? 'Uploading Images...'
                  : isEditMode
                    ? 'Save Changes'
                    : 'Create Product & Continue to Auction'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={viewModalOpened} onClose={handleCloseViewModal} title="Product Details" size="lg" centered>
        {viewingProduct ? (
          (() => {
            const galleryImages = Array.from(
              new Set(
                [
                  viewingProduct.image_url,
                  ...(viewingProduct.image_gallery || []),
                ].filter(Boolean),
              ),
            ) as string[];
            const activeImage = galleryImages[viewingImageIndex] ?? null;

            return (
          <Stack gap="lg">
            <Group align="flex-start" gap="lg" wrap="nowrap">
              <Box
                w={160}
                h={160}
                style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--mantine-color-gray-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {activeImage ? (
                  <Image src={activeImage} alt={viewingProduct.name} w="100%" h="100%" fit="cover" />
                ) : (
                  <IconPackage size={48} color="var(--mantine-color-gray-5)" />
                )}
              </Box>

              <Stack gap="sm" style={{ flex: 1 }}>
                <Group gap="xs">
                  <Badge
                    radius="xl"
                    size="sm"
                    variant="dot"
                    color="gray"
                    style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
                  >
                    {viewingProduct.condition.toUpperCase()}
                  </Badge>
                  <Badge
                    radius="xl"
                    size="sm"
                    variant="light"
                    color={getStatusColor(viewingProduct.status)}
                    style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
                  >
                    {viewingProduct.status}
                  </Badge>
                </Group>

                <Stack gap={6}>
                  <Text fw={600} size="lg" style={{ lineHeight: 1.3 }}>
                    {viewingProduct.name}
                  </Text>
                  <Text fw={700} size="xl" c="orange" style={{ letterSpacing: '-0.01em' }}>
                    {formatCurrency(viewingProduct.base_price)}
                  </Text>
                </Stack>

                <Text size="sm" c="dimmed">
                  Created on {new Date(viewingProduct.created_at).toLocaleString()}
                </Text>
              </Stack>
            </Group>

            {viewingProduct.description && (
              <Text size="sm" c="dimmed">
                {viewingProduct.description}
              </Text>
            )}

            {viewingProduct.tags.length > 0 && (
              <Group gap="xs">
                {viewingProduct.tags.map((tag) => (
                  <Badge key={tag} variant="light" color="gray" radius="xl">
                    #{tag}
                  </Badge>
                ))}
              </Group>
            )}

            {galleryImages.length > 1 && (
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Gallery
                </Text>
                <Group gap="sm">
                  {galleryImages.map((url, index) => {
                    const isActive = index === viewingImageIndex;
                    return (
                      <Paper
                        key={index}
                        withBorder
                        radius="md"
                        p="xs"
                        style={{
                          width: 80,
                          height: 80,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isActive ? '2px solid var(--mantine-color-orange-6)' : undefined,
                          boxShadow: isActive ? '0 0 0 2px rgba(255, 122, 0, 0.2)' : undefined,
                          transition: 'transform 140ms ease',
                        }}
                        onClick={() => setViewingImageIndex(index)}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.transform = 'none';
                        }}
                      >
                        <Image src={url} alt={`Gallery image ${index + 1}`} h={68} fit="cover" radius="sm" />
                      </Paper>
                    );
                  })}
                </Group>
              </Stack>
            )}

            <Group justify="flex-end">
              <Button variant="subtle" onClick={handleCloseViewModal}>
                Close
              </Button>
              <Button variant="light" color="orange" onClick={() => handleEditProduct(viewingProduct)}>
                Edit Product
              </Button>
              <Button
                color="orange"
                onClick={() => {
                  handleCloseViewModal();
                  handleStartAuction(viewingProduct.id);
                }}
              >
                Start Auction
              </Button>
            </Group>
          </Stack>
            );
          })()
        ) : (
          <Skeleton height={200} />
        )}
      </Modal>
    </>
  );
} 