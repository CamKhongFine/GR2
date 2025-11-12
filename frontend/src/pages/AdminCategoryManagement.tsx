import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Button,
  Table,
  Group,
  Text,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  Stack,
  Paper,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus, IconAlertCircle } from '@tabler/icons-react';
import api from '../utils/api';

type Category = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type CategoryFormValues = {
  name: string;
  slug: string;
  parent_id: number | null;
  description: string;
};

const MAX_CATEGORIES = 20;

export default function AdminCategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const createForm = useForm<CategoryFormValues>({
    initialValues: {
      name: '',
      slug: '',
      parent_id: null,
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length < 1 ? 'Name is required' : null),
      slug: (value) => (value.trim().length < 1 ? 'Slug is required' : null),
    },
  });

  const editForm = useForm<CategoryFormValues>({
    initialValues: {
      name: '',
      slug: '',
      parent_id: null,
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length < 1 ? 'Name is required' : null),
      slug: (value) => (value.trim().length < 1 ? 'Slug is required' : null),
    },
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to fetch categories',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getParentName = (parentId: number | null): string => {
    if (!parentId) return '-';
    const parent = categories.find((cat) => cat.id === parentId);
    return parent ? parent.name : `ID: ${parentId}`;
  };

  const handleCreate = async (values: CategoryFormValues) => {
    if (categories.length >= MAX_CATEGORIES) {
      notifications.show({
        title: 'Limit Reached',
        message: `Maximum ${MAX_CATEGORIES} categories allowed`,
        color: 'orange',
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        parent_id: values.parent_id || null,
        description: values.description.trim() || null,
      };
      await api.post('/categories', payload);
      notifications.show({
        title: 'Success',
        message: 'Category created successfully',
        color: 'green',
      });
      setCreateModalOpened(false);
      createForm.reset();
      fetchCategories();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to create category',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    editForm.setValues({
      name: category.name,
      slug: category.slug || '',
      parent_id: category.parent_id,
      description: category.description || '',
    });
    setEditModalOpened(true);
  };

  const handleUpdate = async (values: CategoryFormValues) => {
    if (!selectedCategory) return;

    try {
      setSubmitting(true);
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        parent_id: values.parent_id || null,
        description: values.description.trim() || null,
      };
      await api.put(`/categories/${selectedCategory.id}`, payload);
      notifications.show({
        title: 'Success',
        message: 'Category updated successfully',
        color: 'green',
      });
      setEditModalOpened(false);
      setSelectedCategory(null);
      editForm.reset();
      fetchCategories();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to update category',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteModalOpened(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      setSubmitting(true);
      await api.delete(`/categories/${selectedCategory.id}`);
      notifications.show({
        title: 'Success',
        message: 'Category deleted successfully',
        color: 'green',
      });
      setDeleteModalOpened(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to delete category',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const parentOptions = categories
    .filter((cat) => !selectedCategory || cat.id !== selectedCategory.id)
    .map((cat) => ({
      value: cat.id.toString(),
      label: cat.name,
    }));

  const canCreate = categories.length < MAX_CATEGORIES;

  return (
    <Container size="xl" py="xl">
      <Paper withBorder radius="md" p="md">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2} mb="xs">Category Management</Title>
            <Text c="dimmed" size="sm">
              {categories.length} / {MAX_CATEGORIES} categories
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => setCreateModalOpened(true)}
            disabled={!canCreate}
            color="orange"
          >
            Create Category
          </Button>
        </Group>

        {!canCreate && (
          <Alert icon={<IconAlertCircle size={16} />} color="orange" mb="md">
            Maximum category limit ({MAX_CATEGORIES}) reached. Please delete a category before creating a new one.
          </Alert>
        )}

        <Table.ScrollContainer minWidth={800}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Slug</Table.Th>
                <Table.Th>Parent</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                    <Text c="dimmed">Loading...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : categories.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                    <Text c="dimmed">No categories found</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                categories.map((category) => (
                  <Table.Tr key={category.id}>
                    <Table.Td>{category.id}</Table.Td>
                    <Table.Td>
                      <Text fw={500}>{category.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="gray">
                        {category.slug || '-'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {getParentName(category.parent_id)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" lineClamp={1} style={{ maxWidth: 200 }}>
                        {category.description || '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {new Date(category.created_at).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEdit(category)}
                          aria-label="Edit category"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(category)}
                          aria-label="Delete category"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {/* Create Modal */}
      <Modal
        opened={createModalOpened}
        onClose={() => {
          setCreateModalOpened(false);
          createForm.reset();
        }}
        title="Create Category"
        centered
      >
        <form onSubmit={createForm.onSubmit(handleCreate)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Enter category name"
              required
              {...createForm.getInputProps('name')}
            />
            <TextInput
              label="Slug"
              placeholder="Enter category slug"
              required
              {...createForm.getInputProps('slug')}
            />
            <Select
              label="Parent Category"
              placeholder="Select parent category (optional)"
              data={parentOptions}
              clearable
              value={createForm.values.parent_id?.toString() || null}
              onChange={(value) =>
                createForm.setFieldValue('parent_id', value ? parseInt(value) : null)
              }
            />
            <Textarea
              label="Description"
              placeholder="Enter category description (optional)"
              rows={3}
              {...createForm.getInputProps('description')}
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  setCreateModalOpened(false);
                  createForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting} color="orange">
                Create
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedCategory(null);
          editForm.reset();
        }}
        title="Edit Category"
        centered
      >
        <form onSubmit={editForm.onSubmit(handleUpdate)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Enter category name"
              required
              {...editForm.getInputProps('name')}
            />
            <TextInput
              label="Slug"
              placeholder="Enter category slug"
              required
              {...editForm.getInputProps('slug')}
            />
            <Select
              label="Parent Category"
              placeholder="Select parent category (optional)"
              data={parentOptions}
              clearable
              value={editForm.values.parent_id?.toString() || null}
              onChange={(value) =>
                editForm.setFieldValue('parent_id', value ? parseInt(value) : null)
              }
            />
            <Textarea
              label="Description"
              placeholder="Enter category description (optional)"
              rows={3}
              {...editForm.getInputProps('description')}
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  setEditModalOpened(false);
                  setSelectedCategory(null);
                  editForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting} color="orange">
                Update
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false);
          setSelectedCategory(null);
        }}
        title="Delete Category"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete the category <strong>{selectedCategory?.name}</strong>?
            This action cannot be undone.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => {
                setDeleteModalOpened(false);
                setSelectedCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete} loading={submitting}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

