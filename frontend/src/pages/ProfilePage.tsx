import {
    Container,
    Title,
    Text,
    Paper,
    Avatar,
    Group,
    Stack,
    Button,
    Divider,
    ActionIcon,
    Progress,
    Grid,
    ThemeIcon,
    Box,
    Badge,
} from '@mantine/core';
import {
    IconUser,
    IconMail,
    IconPhone,
    IconMapPin,
    IconArrowLeft,
    IconLock,
    IconShieldLock,
    IconPencil,
    IconCheck,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// --- Types ---
interface UserInfo {
    username?: string;
    email?: string;
    full_name?: string;
    phone?: string;
    address?: string;
}

// --- Sub-components ---

interface InfoRowProps {
    icon: React.ElementType;
    label: string;
    value?: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
    return (
        <Group align="center" wrap="nowrap">
            <ThemeIcon variant="light" color="gray" size="lg" radius="md">
                <Icon size={20} stroke={1.5} />
            </ThemeIcon>
            <Stack gap={2} style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" fw={500} tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                    {label}
                </Text>
                <Text c={value ? 'text' : 'dimmed'} fw={500}>
                    {value || 'Not provided'}
                </Text>
            </Stack>
        </Group>
    );
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user_info');
            if (storedUser) {
                setUserInfo(JSON.parse(storedUser));
            } else {
                // Redirect to login if no user info found
                navigate('/login');
            }
        } catch (error) {
            console.error('Failed to parse user info', error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    if (loading) {
        return null; // Or a proper loading spinner
    }

    if (!userInfo) {
        return null;
    }

    // Calculate dummy profile completeness
    const calculateCompleteness = () => {
        let score = 20; // Base score for account creation
        if (userInfo.full_name) score += 20;
        if (userInfo.email) score += 20;
        if (userInfo.phone) score += 20;
        if (userInfo.address) score += 20;
        return score;
    };

    const completeness = calculateCompleteness();

    return (
        <Box bg="var(--mantine-color-gray-0)" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            {/* Top Navigation */}
            <Container size="md" py="md">
                <Button
                    variant="subtle"
                    color="gray"
                    leftSection={<IconArrowLeft size={18} />}
                    onClick={() => navigate('/')}
                    styles={{ root: { paddingLeft: 0 } }}
                >
                    Back to Home
                </Button>
            </Container>

            <Container size="md" style={{ maxWidth: 860 }}>
                <Grid gutter="xl">
                    {/* Left Column: Avatar & Quick Actions */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack gap="md">
                            <Paper radius="xl" p="xl" shadow="sm" withBorder bg="var(--mantine-color-body)">
                                <Stack align="center" gap="md">
                                    <Box pos="relative">
                                        <Avatar
                                            src={null} // Replace with actual image URL if available
                                            size={140}
                                            radius={140}
                                            color="orange"
                                            variant="filled"
                                            styles={{
                                                root: {
                                                    border: '4px solid var(--mantine-color-body)',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                                    fontSize: 48,
                                                },
                                            }}
                                        >
                                            {(userInfo.username?.[0] || 'U').toUpperCase()}
                                        </Avatar>
                                        <ActionIcon
                                            variant="filled"
                                            color="blue"
                                            size="lg"
                                            radius="xl"
                                            pos="absolute"
                                            bottom={4}
                                            right={4}
                                            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            aria-label="Change avatar"
                                        >
                                            <IconPencil size={18} />
                                        </ActionIcon>
                                    </Box>

                                    <Stack gap={4} align="center" style={{ width: '100%' }}>
                                        <Title order={3} style={{ textAlign: 'center', lineHeight: 1.2 }}>
                                            {userInfo.username || 'User'}
                                        </Title>
                                        <Text c="dimmed" size="sm">
                                            {userInfo.email}
                                        </Text>
                                        <Badge
                                            variant="light"
                                            color="green"
                                            mt="xs"
                                            leftSection={<IconCheck size={12} />}
                                        >
                                            Verified Account
                                        </Badge>
                                    </Stack>

                                    <Button fullWidth radius="xl" variant="light" color="orange" mt="sm">
                                        Edit Profile
                                    </Button>
                                </Stack>
                            </Paper>

                            <Paper radius="xl" p="lg" shadow="sm" withBorder bg="var(--mantine-color-body)">
                                <Stack gap="sm">
                                    <Group justify="space-between">
                                        <Text size="sm" fw={600}>Profile Completeness</Text>
                                        <Text size="sm" fw={700} c="orange">{completeness}%</Text>
                                    </Group>
                                    <Progress value={completeness} color="orange" size="md" radius="xl" />
                                    <Text size="xs" c="dimmed">
                                        Complete your profile to get better recommendations.
                                    </Text>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid.Col>

                    {/* Right Column: Detailed Info & Settings */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Stack gap="lg">
                            {/* Personal Information Card */}
                            <Paper radius="xl" p={32} shadow="sm" withBorder bg="var(--mantine-color-body)">
                                <Stack gap="xl">
                                    <Group justify="space-between" align="center">
                                        <Title order={4}>Personal Information</Title>
                                        <Button variant="subtle" size="xs" color="gray">
                                            Update
                                        </Button>
                                    </Group>

                                    <Stack gap="lg">
                                        <InfoRow
                                            icon={IconUser}
                                            label="Full Name"
                                            value={userInfo.full_name || userInfo.username}
                                        />
                                        <Divider variant="dashed" />
                                        <InfoRow
                                            icon={IconMail}
                                            label="Email Address"
                                            value={userInfo.email}
                                        />
                                        <Divider variant="dashed" />
                                        <InfoRow
                                            icon={IconPhone}
                                            label="Phone Number"
                                            value={userInfo.phone}
                                        />
                                        <Divider variant="dashed" />
                                        <InfoRow
                                            icon={IconMapPin}
                                            label="Shipping Address"
                                            value={userInfo.address}
                                        />
                                    </Stack>
                                </Stack>
                            </Paper>

                            {/* Security Settings Card */}
                            <Paper radius="xl" p={32} shadow="sm" withBorder bg="var(--mantine-color-body)">
                                <Stack gap="md">
                                    <Title order={4}>Security & Settings</Title>
                                    <Group grow>
                                        <Button
                                            variant="default"
                                            size="md"
                                            radius="md"
                                            leftSection={<IconLock size={18} />}
                                            styles={{ inner: { justifyContent: 'flex-start' } }}
                                        >
                                            Change Password
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="md"
                                            radius="md"
                                            leftSection={<IconShieldLock size={18} />}
                                            styles={{ inner: { justifyContent: 'flex-start' } }}
                                        >
                                            2FA Authentication
                                        </Button>
                                    </Group>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}
