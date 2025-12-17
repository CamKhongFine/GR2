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
    ApartmentOutlined,
    ClockCircleOutlined,
    AuditOutlined,
    ApiOutlined,
    BarChartOutlined,
    LockOutlined,
    ThunderboltOutlined,
    EyeOutlined,
    MailOutlined,
    GithubOutlined,
    FileTextOutlined,
    PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { TypewriterEffectSmooth } from '../../components/ui/typewriter-effect';
import heroIllustration from '../../assets/auraflow_hero_illustration.png';

const { Title, Paragraph, Text } = Typography;

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

    const handleUserMenuClick: MenuProps['onClick'] = async ({ key }) => {
        if (key === 'dashboard') {
            navigate('/superadmin/dashboard');
        } else if (key === 'profile') {
            navigate('/profile');
        } else if (key === 'logout') {
            try {
                const apiClient = (await import('../../lib/apiClient')).default;
                await apiClient.post('/api/auth/logout');
            } catch (error) {
                console.error('Logout API error:', error);
            } finally {
                logout();
                localStorage.clear();
                sessionStorage.clear();
                navigate('/login');
            }
        }
    };

    const displayName = useMemo(() => {
        if (!user) return 'Guest';
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName} ${lastName}`.trim() || user.email;
    }, [user]);

    const typewriterWords = [
        { text: "Work", className: "text-blue-600" },
        { text: "smarter", className: "text-blue-600" },
        { text: "with", className: "text-blue-600" },
        { text: "AuraFlow.", className: "text-blue-600" },
    ];

    return (
        <div className="flex flex-col bg-white">
            {/* Header Navigation */}
            <div className="bg-white border-b border-gray-100 py-4 px-8 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                                AuraFlow
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#who-its-for" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Who It's For</a>
                            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</a>
                            <a href="#use-cases" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Use Cases</a>
                            <a href="#contact-us" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Contact</a>
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
                                        <span className="text-gray-700">{displayName}</span>
                                    </div>
                                </Dropdown>
                            ) : (
                                <>
                                    <Button
                                        className="h-10 px-6 bg-white text-blue-600 hover:text-blue-500 border-0 font-medium"
                                        onClick={() => navigate('/login')}
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        type="primary"
                                        className="h-10 px-6 bg-blue-600 hover:bg-blue-500 border-0 font-medium rounded-lg"
                                        onClick={() => {
                                            document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        Request a Demo
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-24 px-8">
                <div className="max-w-7xl mx-auto">
                    <Row gutter={[64, 48]} align="middle">
                        <Col xs={24} lg={14}>
                            <div className="mb-8 lg:mb-0">
                                <div className="mb-6">
                                    <TypewriterEffectSmooth
                                        words={typewriterWords}
                                        className="text-left"
                                        cursorClassName="bg-blue-600"
                                    />
                                </div>
                                <Paragraph className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    AuraFlow is a multi-tenant workflow management system that helps organizations define workflows,
                                    assign role-based tasks, and maintain complete visibility across all processes.
                                </Paragraph>
                                <div className="flex flex-wrap gap-4">
                                    <Button
                                        type="primary"
                                        size="large"
                                        className="h-14 px-8 text-base font-medium bg-blue-600 hover:bg-blue-500 border-0 rounded-lg shadow-lg"
                                        onClick={() => {
                                            document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        Request a Demo
                                    </Button>
                                    <Button
                                        size="large"
                                        className="h-14 px-8 text-base font-medium border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        onClick={() => {
                                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        View Features
                                    </Button>
                                </div>
                                <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-600" />
                                        <span>Enterprise-ready</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-600" />
                                        <span>Secure by design</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-600" />
                                        <span>Scalable architecture</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} lg={10}>
                            <div className="relative">
                                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 overflow-hidden">
                                    <img
                                        src={heroIllustration}
                                        alt="AuraFlow Workflow Dashboard"
                                        className="w-full h-auto rounded-2xl"
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Who AuraFlow Is For Section */}
            <div id="who-its-for" className="py-24 px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                            Who AuraFlow Is For
                        </Title>
                        <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Built for teams and organizations that need structured, automated, and transparent workflow management
                        </Paragraph>
                    </div>

                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={12} lg={6}>
                            <Card className="h-full border-0 rounded-2xl shadow-md hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-white p-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <TeamOutlined className="text-3xl text-white" />
                                    </div>
                                    <Title level={4} className="mb-3 text-gray-900">Operations Teams</Title>
                                    <Paragraph className="text-gray-600">
                                        Eliminate manual coordination and reduce process bottlenecks with automated workflow orchestration
                                    </Paragraph>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12} lg={6}>
                            <Card className="h-full border-0 rounded-2xl shadow-md hover:shadow-xl transition-all bg-gradient-to-br from-green-50 to-white p-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <SettingOutlined className="text-3xl text-white" />
                                    </div>
                                    <Title level={4} className="mb-3 text-gray-900">IT & System Admins</Title>
                                    <Paragraph className="text-gray-600">
                                        Manage multi-tenant environments with secure, role-based access control and complete audit trails
                                    </Paragraph>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12} lg={6}>
                            <Card className="h-full border-0 rounded-2xl shadow-md hover:shadow-xl transition-all bg-gradient-to-br from-purple-50 to-white p-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <BarChartOutlined className="text-3xl text-white" />
                                    </div>
                                    <Title level={4} className="mb-3 text-gray-900">Department Managers</Title>
                                    <Paragraph className="text-gray-600">
                                        Gain real-time visibility into task progress, team workload, and process performance metrics
                                    </Paragraph>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12} lg={6}>
                            <Card className="h-full border-0 rounded-2xl shadow-md hover:shadow-xl transition-all bg-gradient-to-br from-orange-50 to-white p-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <RocketOutlined className="text-3xl text-white" />
                                    </div>
                                    <Title level={4} className="mb-3 text-gray-900">Enterprise Organizations</Title>
                                    <Paragraph className="text-gray-600">
                                        Scale workflows across multiple departments with isolated, secure tenant environments
                                    </Paragraph>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Core Features Section */}
            <div id="features" className="py-24 px-8 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                            Core Product Capabilities
                        </Title>
                        <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Everything you need to build, manage, and monitor enterprise workflows
                        </Paragraph>
                    </div>

                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={12} lg={8}>
                            <Card className="h-full border-0 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <ApartmentOutlined className="text-2xl text-blue-600" />
                                    </div>
                                    <div>
                                        <Title level={4} className="mb-2 text-gray-900">Workflow & Process Definition</Title>
                                        <Paragraph className="text-gray-600 mb-0">
                                            Define custom workflows with steps, states, and transitions tailored to your business processes
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Card className="h-full border-0 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <UserOutlined className="text-2xl text-green-600" />
                                    </div>
                                    <div>
                                        <Title level={4} className="mb-2 text-gray-900">Role-Based Task Assignment</Title>
                                        <Paragraph className="text-gray-600 mb-0">
                                            Assign tasks based on roles and permissions, ensuring the right people handle the right work
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Card className="h-full border-0 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <SafetyCertificateOutlined className="text-2xl text-purple-600" />
                                    </div>
                                    <div>
                                        <Title level={4} className="mb-2 text-gray-900">Multi-Tenant Architecture</Title>
                                        <Paragraph className="text-gray-600 mb-0">
                                            Isolated environments for departments and organizations with complete data separation
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Card className="h-full border-0 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <LockOutlined className="text-2xl text-indigo-600" />
                                    </div>
                                    <div>
                                        <Title level={4} className="mb-2 text-gray-900">Enterprise Authentication</Title>
                                        <Paragraph className="text-gray-600 mb-0">
                                            Secure authentication and authorization via Keycloak with OIDC support
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Card className="h-full border-0 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <EyeOutlined className="text-2xl text-yellow-600" />
                                    </div>
                                    <div>
                                        <Title level={4} className="mb-2 text-gray-900">Real-Time Monitoring</Title>
                                        <Paragraph className="text-gray-600 mb-0">
                                            Track workflow progress, task status, and team performance in real-time dashboards
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Card className="h-full border-0 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <AuditOutlined className="text-2xl text-red-600" />
                                    </div>
                                    <div>
                                        <Title level={4} className="mb-2 text-gray-900">Complete Audit Logs</Title>
                                        <Paragraph className="text-gray-600 mb-0">
                                            Comprehensive tracking and audit trails for compliance and accountability
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Value Proposition Section */}
            <div className="py-24 px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                            Why Choose AuraFlow
                        </Title>
                        <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Built for enterprise scale with security, performance, and extensibility at its core
                        </Paragraph>
                    </div>

                    <Row gutter={[48, 48]}>
                        <Col xs={24} md={12}>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <ThunderboltOutlined className="text-2xl text-white" />
                                    </div>
                                </div>
                                <div>
                                    <Title level={3} className="text-2xl mb-3 text-gray-900">Reduce Manual Coordination</Title>
                                    <Paragraph className="text-gray-600 text-lg">
                                        Eliminate email chains and spreadsheets. Automate task routing, notifications, and approvals
                                        to keep work moving without constant manual intervention.
                                    </Paragraph>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center">
                                        <EyeOutlined className="text-2xl text-white" />
                                    </div>
                                </div>
                                <div>
                                    <Title level={3} className="text-2xl mb-3 text-gray-900">Increase Transparency & Accountability</Title>
                                    <Paragraph className="text-gray-600 text-lg">
                                        Every action is tracked and logged. Know exactly who did what, when, and why with
                                        complete visibility across all workflows and processes.
                                    </Paragraph>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center">
                                        <RocketOutlined className="text-2xl text-white" />
                                    </div>
                                </div>
                                <div>
                                    <Title level={3} className="text-2xl mb-3 text-gray-900">Scale Across Teams & Tenants</Title>
                                    <Paragraph className="text-gray-600 text-lg">
                                        Multi-tenant architecture allows you to manage workflows for multiple departments or
                                        organizations from a single platform with complete data isolation.
                                    </Paragraph>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center">
                                        <SafetyCertificateOutlined className="text-2xl text-white" />
                                    </div>
                                </div>
                                <div>
                                    <Title level={3} className="text-2xl mb-3 text-gray-900">Secure, Role-Based Access Control</Title>
                                    <Paragraph className="text-gray-600 text-lg">
                                        Enterprise-grade security with Keycloak integration. Define granular permissions and
                                        ensure users only access what they need.
                                    </Paragraph>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Use Cases Section */}
            <div id="use-cases" className="py-24 px-8 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                            Real-World Use Cases
                        </Title>
                        <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
                            See how organizations use AuraFlow to streamline their operations
                        </Paragraph>
                    </div>

                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={8}>
                            <Card className="h-full border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
                                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <CheckCircleOutlined className="text-7xl text-white opacity-90" />
                                </div>
                                <div className="p-6">
                                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                                        Case Study
                                    </div>
                                    <Title level={3} className="text-2xl mb-3 text-gray-900">Internal Approval Workflows</Title>
                                    <Paragraph className="text-gray-600 mb-4">
                                        Automate multi-step approval processes for purchase orders, expense reports, time-off requests,
                                        and document reviews with configurable routing rules.
                                    </Paragraph>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-gray-700">
                                            <CheckCircleOutlined className="text-green-600 mt-1" />
                                            <span>Automated routing based on amount/type</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-700">
                                            <CheckCircleOutlined className="text-green-600 mt-1" />
                                            <span>Parallel and sequential approvals</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-700">
                                            <CheckCircleOutlined className="text-green-600 mt-1" />
                                            <span>Escalation and deadline management</span>
                                        </li>
                                    </ul>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="h-full border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
                                <div className="h-48 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                                    <AuditOutlined className="text-7xl text-white opacity-90" />
                                </div>
                                <div className="p-6">
                                    <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
                                        Case Study
                                    </div>
                                    <Title level={3} className="text-2xl mb-3 text-gray-900">Incident & Issue Handling</Title>
                                    <Paragraph className="text-gray-600 mb-4">
                                        Track and resolve incidents, support tickets, and operational issues with structured
                                        workflows that ensure nothing falls through the cracks.
                                    </Paragraph>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-gray-700">
                                            <CheckCircleOutlined className="text-green-600 mt-1" />
                                            <span>Priority-based assignment</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-700">
                                            <CheckCircleOutlined className="text-green-600 mt-1" />
                                            <span>SLA tracking and alerts</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-700">
                                            <CheckCircleOutlined className="text-green-600 mt-1" />
                                            <span>Root cause analysis workflows</span>
                                        </li>
                                    </ul>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="h-full border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
                                <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                    <TeamOutlined className="text-7xl text-white opacity-90" />
                                </div>
                                <div className="p-6">
                                    <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                                        Case Study
                                    </div>
                                    <Title level={3} className="text-2xl mb-3 text-gray-900">Cross-Department Coordination</Title>
                                    <Paragraph className="text-gray-600 mb-4">
                                        Orchestrate complex processes that span multiple teams and departments with clear
                                        handoffs, dependencies, and accountability.
                                    </Paragraph>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-gray-700">
                                            <CheckCircleOutlined className="text-green-600 mt-1" />
                                            <span>Cross-functional task dependencies</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-700">
                                            <CheckCircleOutlined className="text-green-600 mt-1" />
                                            <span>Shared visibility across teams</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-700">
                                            <CheckCircleOutlined className="text-green-600 mt-1" />
                                            <span>Automated handoff notifications</span>
                                        </li>
                                    </ul>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Contact Us Section */}
            <div id="contact-us" className="py-24 px-8 bg-gradient-to-br from-white via-blue-50 to-purple-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                            Get in Touch
                        </Title>
                        <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Ready to transform your workflows? Our team is here to help you get started with AuraFlow.
                        </Paragraph>
                    </div>

                    <Row gutter={[48, 48]} justify="center">
                        {/* Email Card */}
                        <Col xs={24} md={12} lg={10}>
                            <Card className="h-full border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                <div className="relative">
                                    {/* Gradient Background */}
                                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-500 to-blue-600"></div>

                                    {/* Icon */}
                                    <div className="relative pt-8 pb-6 flex justify-center">
                                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                                            <MailOutlined className="text-5xl text-blue-600" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="px-8 pb-8 text-center">
                                        <Title level={3} className="text-2xl mb-3 text-gray-900">Email Us</Title>
                                        <Paragraph className="text-gray-600 mb-6">
                                            Send us an email and we'll respond within 24 hours
                                        </Paragraph>
                                        <a
                                            href="mailto:contact@auraflow.com"
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 font-semibold text-lg transition-colors"
                                        >
                                            <MailOutlined />
                                            contact@auraflow.com
                                        </a>
                                        <div className="mt-6">
                                            <Button
                                                type="primary"
                                                size="large"
                                                className="h-12 px-8 bg-blue-600 hover:bg-blue-500 border-0 rounded-lg"
                                                icon={<MailOutlined />}
                                                href="mailto:contact@auraflow.com"
                                            >
                                                Send Email
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* Phone Card */}
                        <Col xs={24} md={12} lg={10}>
                            <Card className="h-full border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                <div className="relative">
                                    {/* Gradient Background */}
                                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-green-500 to-green-600"></div>

                                    {/* Icon */}
                                    <div className="relative pt-8 pb-6 flex justify-center">
                                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                                            <PhoneOutlined className="text-5xl text-green-600" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="px-8 pb-8 text-center">
                                        <Title level={3} className="text-2xl mb-3 text-gray-900">Call Us</Title>
                                        <Paragraph className="text-gray-600 mb-6">
                                            Speak directly with our team Monday - Friday, 9AM - 6PM EST
                                        </Paragraph>
                                        <a
                                            href="tel:+84972222222"
                                            className="inline-flex items-center gap-2 text-green-600 hover:text-green-500 font-semibold text-lg transition-colors"
                                        >
                                            <PhoneOutlined />
                                            +84 972 222 222
                                        </a>
                                        <div className="mt-6">
                                            <Button
                                                type="primary"
                                                size="large"
                                                className="h-12 px-8 bg-green-600 hover:bg-green-500 border-0 rounded-lg"
                                                icon={<PhoneOutlined />}
                                                href="tel:+15551234567"
                                            >
                                                Call Now
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Additional Info */}
                    <div className="mt-16 text-center">
                        <Card className="inline-block border-0 rounded-2xl shadow-lg bg-white/80 backdrop-blur">
                            <div className="px-8 py-6">
                                <div className="flex flex-wrap items-center justify-center gap-6 text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-blue-600 text-xl" />
                                        <span className="font-medium">Enterprise Support Available</span>
                                    </div>
                                    <span className="text-gray-300">•</span>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-blue-600 text-xl" />
                                        <span className="font-medium">Free Consultation</span>
                                    </div>
                                    <span className="text-gray-300">•</span>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-blue-600 text-xl" />
                                        <span className="font-medium">Custom Solutions</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer id="contact" className="bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-gray-300 py-16 px-8">
                <div className="max-w-7xl mx-auto">
                    <Row gutter={[48, 48]}>
                        <Col xs={24} md={8}>
                            <div className="mb-6">
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent mb-4">
                                    AuraFlow
                                </div>
                                <Paragraph className="text-gray-300 mb-4 leading-relaxed">
                                    Multi-tenant workflow management system designed for enterprise organizations.
                                    Structure, automate, and monitor your internal processes with confidence.
                                </Paragraph>
                                <div className="flex items-center gap-2 text-blue-300">
                                    <SafetyCertificateOutlined />
                                    <span className="text-sm font-medium">Enterprise-ready • Secure by design</span>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="-mt-5">
                                <Title level={4} className="!text-white mb-4 font-semibold">Product</Title>
                                <ul className="space-y-3 list-none pl-0">
                                    <li>
                                        <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2">
                                            <span className="text-blue-400">→</span> Features
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#use-cases" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2">
                                            <span className="text-blue-400">→</span> Use Cases
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#who-its-for" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2">
                                            <span className="text-blue-400">→</span> Who It's For
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/login" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2">
                                            <span className="text-blue-400">→</span> Request Demo
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="-mt-5">
                                <Title level={4} className="!text-white mb-4 font-semibold">Resources</Title>
                                <ul className="space-y-3 mb-6 list-none pl-0">
                                    <li className="flex items-center gap-2">
                                        <FileTextOutlined className="text-blue-400" />
                                        <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                                            Documentation
                                        </a>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <GithubOutlined className="text-blue-400" />
                                        <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                                            GitHub
                                        </a>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ApiOutlined className="text-blue-400" />
                                        <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                                            API Reference
                                        </a>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <SafetyCertificateOutlined className="text-blue-400" />
                                        <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                                            Privacy Policy
                                        </a>
                                    </li>
                                </ul>
                                <div className="flex items-center gap-2 text-gray-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                    <MailOutlined className="text-blue-400" />
                                    <a href="mailto:contact@auraflow.com" className="hover:text-blue-400 transition-colors text-sm">
                                        contact@auraflow.com
                                    </a>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <div className="border-t border-slate-700 mt-12 pt-8 text-center">
                        <p className="text-gray-400 text-sm">© 2025 AuraFlow. All rights reserved. Built for enterprise workflow automation.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
