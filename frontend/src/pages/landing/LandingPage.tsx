import React, { useEffect, useMemo } from 'react';
import { Typography, Button, Row, Col, Card, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
    RocketOutlined,
    TeamOutlined,
    SafetyCertificateOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import { useUserStore } from '../../store/userStore';

const { Title, Paragraph, Text } = Typography;

const words = [
    {
        text: "Manage",
        className: "text-white",
    },
    {
        text: "Tasks",
        className: "text-white",
    },
    {
        text: "with",
        className: "text-white",
    },
    {
        text: "AuraFlow.",
        className: "text-blue-300",
    },
];

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loadUser, logout } = useUserStore();

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const userMenuItems: MenuProps['items'] = user
        ? [
            { key: 'dashboard', label: 'Manage', icon: <SettingOutlined /> },
            { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
            { key: 'logout', label: 'Logout', icon: <LogoutOutlined /> },
        ]
        : [];

    const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'dashboard') {
            navigate('/admin/tenants');
        } else if (key === 'profile') {
            navigate('/profile');
        } else if (key === 'logout') {
            logout();
            navigate('/login');
        }
    };

    const displayName = useMemo(() => {
        if (!user) return 'Guest';
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName} ${lastName}`.trim() || user.email;
    }, [user]);

    return (
        <div className="flex flex-col">
            {/* Hero Section with Integrated Header */}
            <div className="relative bg-gradient-to-br from-[#1677FF] to-[#4096FF] py-6 px-8 min-h-[700px]">
                {/* Header Navigation */}
                <div className="relative max-w-7xl mx-auto mb-16 z-50">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="text-2xl font-bold text-white">AuraFlow</div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-white hover:text-blue-200 transition-colors">Features</a>
                            <a href="#solutions" className="text-white hover:text-blue-200 transition-colors">Solutions</a>
                            <a href="#pricing" className="text-white hover:text-blue-200 transition-colors">Pricing</a>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-4">
                            {user ? (
                                <Dropdown
                                    menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                                    placement="bottomRight"
                                    trigger={['click']}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                                        <Avatar
                                            size="small"
                                            src={user?.avatarUrl}
                                            icon={!user?.avatarUrl ? <UserOutlined /> : undefined}
                                        />
                                        <span className="text-white">{displayName}</span>
                                    </div>
                                </Dropdown>
                            ) : (
                                <>
                                    <Button
                                        className="h-12 px-6 bg-white text-[#1677FF] hover:bg-[#ffe4a3] border-0 font-medium"
                                        onClick={() => navigate('/login')}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        className="h-12 px-6 bg-white text-[#1677FF] hover:bg-blue-50  border-0 font-medium"
                                        onClick={() => navigate('/login')}
                                    >
                                        Try AuraFlow Free
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Decorative wave pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="currentColor" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>

                <div className="relative max-w-7xl mx-auto w-full mt-8">
                    <Row gutter={[64, 64]} align="middle">
                        {/* Left Content */}
                        <Col xs={24} lg={12}>
                            <div className="text-white mb-8 lg:mb-0 relative z-20">
                                <div className="mb-8">
                                    <TypewriterEffectSmooth words={words} />
                                </div>
                                <Paragraph className="text-lg text-white/90 mb-8 leading-relaxed max-w-xl">
                                    Project management software that enables your teams to collaborate, plan, analyze and manage everyday tasks
                                </Paragraph>
                                <Button
                                    type="primary"
                                    size="large"
                                    className="h-14 px-8 text-base font-medium bg-white text-[#1677FF] hover:bg-blue-50 border-0 shadow-lg font-semibold"
                                    onClick={() => navigate('/login')}
                                    icon={<ArrowRightOutlined />}
                                    iconPosition="end"
                                >
                                    Try AuraFlow Free
                                </Button>
                            </div>
                        </Col>

                        {/* Right Illustration */}
                        <Col xs={24} lg={12}>
                            <div className="relative z-10 lg:ml-8">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                    <div className="bg-white rounded-xl p-6 shadow-2xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                            </div>
                                        </div>
                                        <Row gutter={[16, 16]}>
                                            <Col span={12}>
                                                <div className="bg-blue-100 rounded-lg p-4 h-32 flex items-center justify-center">
                                                    <div className="w-20 h-20 rounded-full bg-blue-500"></div>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div className="bg-purple-100 rounded-lg p-4 h-32">
                                                    <div className="space-y-2">
                                                        <div className="h-3 bg-purple-300 rounded w-3/4"></div>
                                                        <div className="h-3 bg-purple-300 rounded w-1/2"></div>
                                                        <div className="h-3 bg-purple-300 rounded w-2/3"></div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col span={24}>
                                                <div className="bg-yellow-100 rounded-lg p-4 h-24">
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                                            <div key={i} className="flex-1 bg-yellow-400 rounded" style={{ height: `${Math.random() * 60 + 20}px` }}></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-24 px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl md:text-5xl font-bold mb-4 text-[#212529]">
                            Work together, anywhere
                        </Title>
                        <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Keep everyone on the same page with real-time collaboration and powerful project management tools
                        </Paragraph>
                    </div>

                    <Row gutter={[48, 48]}>
                        <Col xs={24} md={8}>
                            <div className="text-center">
                                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <RocketOutlined className="text-4xl text-[#1677FF]" />
                                </div>
                                <Title level={4} className="mb-3 text-[#212529]">Workflow Automation</Title>
                                <Paragraph className="text-gray-600">
                                    Streamline your processes with customizable workflows that adapt to your team's unique needs
                                </Paragraph>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <TeamOutlined className="text-4xl text-green-600" />
                                </div>
                                <Title level={4} className="mb-3 text-[#212529]">Real-time Collaboration</Title>
                                <Paragraph className="text-gray-600">
                                    Work together seamlessly with instant updates, comments, and notifications for your entire team
                                </Paragraph>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="text-center">
                                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <SafetyCertificateOutlined className="text-4xl text-purple-600" />
                                </div>
                                <Title level={4} className="mb-3 text-[#212529]">Enterprise Security</Title>
                                <Paragraph className="text-gray-600">
                                    Multi-tenant architecture ensures your data is isolated, secure, and always available
                                </Paragraph>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Use Case Section */}
            <div id="solutions" className="py-24 px-8 bg-gradient-to-br from-[#1677FF] to-[#4096FF]">
                <div className="max-w-7xl mx-auto">
                    <Row gutter={[64, 48]} align="middle">
                        <Col xs={24} lg={12}>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 h-80 flex items-center justify-center">
                                <div className="text-center text-white/60 text-6xl">
                                    <TeamOutlined />
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} lg={12}>
                            <div className="text-white">
                                <Title level={2} className="text-white text-3xl md:text-4xl font-bold mb-6">
                                    Use as Extension
                                </Title>
                                <Paragraph className="text-white/90 text-lg mb-8 leading-relaxed">
                                    Use AuraFlow as your browser extension to manage tasks on the go. Access your projects from anywhere and stay productive wherever you are.
                                </Paragraph>
                                <Button
                                    size="large"
                                    className="h-12 px-8 bg-white text-[#1677FF] hover:bg-blue-50 border-0 font-semibold"
                                    icon={<ArrowRightOutlined />}
                                    iconPosition="end"
                                >
                                    Let's Go
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Customization Section */}
            <div className="py-24 px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <Row gutter={[64, 48]} align="middle">
                        <Col xs={24} lg={12} order={{ xs: 2, lg: 1 }}>
                            <div className="text-[#212529]">
                                <Title level={2} className="text-3xl md:text-4xl font-bold mb-6">
                                    Customize it to your needs
                                </Title>
                                <Paragraph className="text-gray-600 text-lg mb-8 leading-relaxed">
                                    Customize the app with plugins, custom themes and multiple text editors (Rich Text or Markdown). Or create your own scripts and plugins using the Extension API.
                                </Paragraph>
                                <Button
                                    type="primary"
                                    size="large"
                                    className="h-12 px-8 bg-[#1677FF] hover:bg-[#4096FF] border-0"
                                    icon={<ArrowRightOutlined />}
                                    iconPosition="end"
                                >
                                    Let's Go
                                </Button>
                            </div>
                        </Col>
                        <Col xs={24} lg={12} order={{ xs: 1, lg: 2 }}>
                            <div className="bg-blue-50 rounded-2xl p-8 h-80 flex items-center justify-center">
                                <div className="text-center text-blue-300 text-6xl">
                                    <RocketOutlined />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="py-24 px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl md:text-5xl font-bold mb-4 text-[#212529]">
                            Choose Your Plan
                        </Title>
                        <Paragraph className="text-lg text-gray-600">
                            Whether you want to get organized, keep your personal life on track, or boost workplace productivity, AuraFlow has the right plan for you.
                        </Paragraph>
                    </div>

                    <Row gutter={[32, 32]} justify="center">
                        <Col xs={24} md={8}>
                            <Card className="h-full border border-[#FFE492] rounded-xl hover:shadow-xl transition-all p-6">
                                <div className="mb-6">
                                    <Title level={4} className="mb-2">Free</Title>
                                    <div className="text-4xl font-bold text-[#212529] mb-1">
                                        $0
                                    </div>
                                    <Text className="text-gray-500">Capture ideas and find them quickly</Text>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#212529] mt-1" />
                                        <Text>Sync unlimited devices</Text>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#212529] mt-1" />
                                        <Text>10 GB monthly uploads</Text>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#212529] mt-1" />
                                        <Text>200 MB max. note size</Text>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#212529] mt-1" />
                                        <Text>Customize Home dashboard</Text>
                                    </div>
                                </div>
                                <Button block size="large" className="h-12 border-2 border-[#FFE492] hover:bg-[#FFE492]">
                                    Get Started
                                </Button>
                            </Card>
                        </Col>

                        <Col xs={24} md={8}>
                            <Card className="h-full bg-[#1677FF] border-0 rounded-xl shadow-2xl p-6 relative">
                                <div className="mb-6">
                                    <Title level={4} className="mb-2 text-white">Personal</Title>
                                    <div className="text-4xl font-bold text-[#FFE492] mb-1">
                                        $11.99
                                    </div>
                                    <Text className="text-blue-100">Keep home and family on track</Text>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#FFE492] mt-1" />
                                        <Text className="text-white">Sync unlimited devices</Text>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#FFE492] mt-1" />
                                        <Text className="text-white">10 GB monthly uploads</Text>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#FFE492] mt-1" />
                                        <Text className="text-white">200 MB max. note size</Text>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#FFE492] mt-1" />
                                        <Text className="text-white">Customize Home dashboard</Text>
                                    </div>
                                </div>
                                <Button
                                    block
                                    size="large"
                                    className="h-12 bg-[#4F9CF9] hover:bg-[#3d8ae5] text-white border-0"
                                >
                                    Get Started
                                </Button>
                            </Card>
                        </Col>

                        <Col xs={24} md={8}>
                            <Card className="h-full border border-[#FFE492] rounded-xl hover:shadow-xl transition-all p-6">
                                <div className="mb-6">
                                    <Title level={4} className="mb-2">Organization</Title>
                                    <div className="text-4xl font-bold text-[#212529] mb-1">
                                        $49.99
                                    </div>
                                    <Text className="text-gray-500">Capture ideas and find them quickly</Text>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#212529] mt-1" />
                                        <Text>Sync unlimited devices</Text>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#212529] mt-1" />
                                        <Text>10 GB monthly uploads</Text>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#212529] mt-1" />
                                        <Text>200 MB max. note size</Text>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircleOutlined className="text-[#212529] mt-1" />
                                        <Text>Customize Home dashboard</Text>
                                    </div>
                                </div>
                                <Button block size="large" className="h-12 border-2 border-[#FFE492] hover:bg-[#FFE492]">
                                    Get Started
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 px-8 bg-gradient-to-r from-[#1677FF] to-[#4096FF]">
                <div className="max-w-4xl mx-auto text-center">
                    <Title level={2} className="text-white text-3xl md:text-5xl font-bold mb-6">
                        Your work, everywhere you are
                    </Title>
                    <Paragraph className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
                        Access your notes from your computer, phone or tablet by synchronising with various services. AuraFlow is available on all platforms.
                    </Paragraph>
                    <Button
                        size="large"
                        className="h-14 px-12 text-base font-medium bg-white text-[#1677FF] hover:bg-blue-50 border-0 shadow-xl font-semibold"
                        onClick={() => navigate('/login')}
                        icon={<ArrowRightOutlined />}
                        iconPosition="end"
                    >
                        Try AuraFlow Free
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
