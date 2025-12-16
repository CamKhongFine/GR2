import React from 'react';
import { Typography, Button, Row, Col, Card } from 'antd';
import {
    RocketOutlined,
    TeamOutlined,
    SafetyCertificateOutlined,
    CheckCircleOutlined,
    ThunderboltOutlined,
    CloudOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';

const { Title, Paragraph } = Typography;

const words = [
    {
        text: "Manage",
    },
    {
        text: "Tasks",
    },
    {
        text: "with",
    },
    {
        text: "AuraFlow.",
        className: "text-blue-500 dark:text-blue-500",
    },
];

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col">
            {/* Hero Section with Gradient Background */}
            <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24 px-8 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

                <div className="relative max-w-6xl mx-auto flex flex-col items-center text-center z-10">
                    <TypewriterEffectSmooth words={words} />
                    <Paragraph className="text-xl text-gray-600 mb-10 max-w-2xl">
                        A task management platform that helps teams collaborate efficiently, and manage work in one place
                    </Paragraph>
                    <div className="flex justify-center gap-4 mb-16">
                        <Button
                            type="primary"
                            size="large"
                            className="h-14 px-10 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                            onClick={() => navigate('/login')}
                        >
                            Get Started Free
                        </Button>
                        <Button
                            size="large"
                            className="h-14 px-10 text-lg font-semibold border-2 hover:border-blue-500 transition-all"
                        >
                            Watch Demo
                        </Button>
                    </div>

                    {/* Dashboard Preview with Enhanced Shadow */}
                    <div className="w-full max-w-5xl">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white p-2">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10"></div>
                            <img
                                src="https://placehold.co/1200x600/f0f2f5/1677ff?text=Dashboard+Preview"
                                alt="Dashboard Preview"
                                className="w-full rounded-xl relative z-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section with Cards */}
            <div className="py-24 px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl font-bold mb-4">
                            Everything you need to succeed
                        </Title>
                        <Paragraph className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Powerful features designed to help your team work smarter, not harder
                        </Paragraph>
                    </div>

                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={8}>
                            <Card
                                className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl"
                                bodyStyle={{ padding: '32px' }}
                            >
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                    <RocketOutlined className="text-3xl text-blue-600" />
                                </div>
                                <Title level={4} className="mb-3">Workflow Automation</Title>
                                <Paragraph className="text-gray-600">
                                    Streamline your processes with customizable workflows that adapt to your team's unique needs.
                                </Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card
                                className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl"
                                bodyStyle={{ padding: '32px' }}
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                                    <TeamOutlined className="text-3xl text-green-600" />
                                </div>
                                <Title level={4} className="mb-3">Real-time Collaboration</Title>
                                <Paragraph className="text-gray-600">
                                    Work together seamlessly with instant updates, comments, and notifications for your entire team.
                                </Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card
                                className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl"
                                bodyStyle={{ padding: '32px' }}
                            >
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                    <SafetyCertificateOutlined className="text-3xl text-purple-600" />
                                </div>
                                <Title level={4} className="mb-3">Enterprise Security</Title>
                                <Paragraph className="text-gray-600">
                                    Multi-tenant architecture ensures your data is isolated, secure, and always available when you need it.
                                </Paragraph>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-20 px-8 bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="max-w-6xl mx-auto">
                    <Row gutter={[48, 48]} className="text-center text-white">
                        <Col xs={24} md={8}>
                            <div className="flex flex-col items-center">
                                <Title level={1} className="text-white mb-2 text-5xl font-bold">10K+</Title>
                                <Paragraph className="text-blue-100 text-lg">Active Users</Paragraph>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="flex flex-col items-center">
                                <Title level={1} className="text-white mb-2 text-5xl font-bold">99.9%</Title>
                                <Paragraph className="text-blue-100 text-lg">Uptime</Paragraph>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="flex flex-col items-center">
                                <Title level={1} className="text-white mb-2 text-5xl font-bold">500K+</Title>
                                <Paragraph className="text-blue-100 text-lg">Tasks Completed</Paragraph>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Additional Features */}
            <div className="py-24 px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} md={12}>
                            <Title level={2} className="text-3xl font-bold mb-6">
                                Built for modern teams
                            </Title>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircleOutlined className="text-green-500 text-xl mt-1" />
                                    <div>
                                        <Title level={5} className="mb-1">Intuitive Interface</Title>
                                        <Paragraph className="text-gray-600 mb-0">
                                            Clean, modern design that your team will love to use every day
                                        </Paragraph>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ThunderboltOutlined className="text-yellow-500 text-xl mt-1" />
                                    <div>
                                        <Title level={5} className="mb-1">Lightning Fast</Title>
                                        <Paragraph className="text-gray-600 mb-0">
                                            Optimized performance ensures smooth experience even with large datasets
                                        </Paragraph>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CloudOutlined className="text-blue-500 text-xl mt-1" />
                                    <div>
                                        <Title level={5} className="mb-1">Cloud-Based</Title>
                                        <Paragraph className="text-gray-600 mb-0">
                                            Access your work from anywhere, on any device, at any time
                                        </Paragraph>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-3xl transform rotate-3"></div>
                                <img
                                    src="https://placehold.co/600x400/e0e7ff/4f46e5?text=Team+Collaboration"
                                    alt="Team Collaboration"
                                    className="relative rounded-3xl shadow-2xl w-full"
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="py-24 px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl font-bold mb-4">
                            Simple, Transparent Pricing
                        </Title>
                        <Paragraph className="text-gray-500 text-lg">
                            Choose the plan that's right for your team
                        </Paragraph>
                    </div>
                    <Row gutter={[32, 32]} justify="center">
                        <Col xs={24} md={8}>
                            <Card className="h-full text-center border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all duration-300">
                                <Title level={3} className="mb-2">Starter</Title>
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    $0
                                    <span className="text-lg text-gray-400 font-normal">/mo</span>
                                </div>
                                <Paragraph className="text-gray-500 mb-6">Perfect for small teams</Paragraph>
                                <Button block size="large" className="mb-6 h-12 font-semibold">
                                    Get Started
                                </Button>
                                <div className="text-left space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>Up to 5 team members</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>Basic features</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>Community support</span>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="h-full text-center border-2 border-blue-500 rounded-2xl shadow-xl relative overflow-visible">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                                    Most Popular
                                </div>
                                <Title level={3} className="mb-2 mt-4">Pro</Title>
                                <div className="text-5xl font-bold text-blue-600 mb-2">
                                    $29
                                    <span className="text-lg text-gray-400 font-normal">/mo</span>
                                </div>
                                <Paragraph className="text-gray-500 mb-6">For growing teams</Paragraph>
                                <Button type="primary" block size="large" className="mb-6 h-12 font-semibold shadow-lg">
                                    Start Free Trial
                                </Button>
                                <div className="text-left space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>Unlimited team members</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>Advanced features</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>Priority support</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>Custom integrations</span>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="h-full text-center border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all duration-300">
                                <Title level={3} className="mb-2">Enterprise</Title>
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    Custom
                                </div>
                                <Paragraph className="text-gray-500 mb-6">For large organizations</Paragraph>
                                <Button block size="large" className="mb-6 h-12 font-semibold">
                                    Contact Sales
                                </Button>
                                <div className="text-left space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>Everything in Pro</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>Dedicated support</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>SLA guarantee</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>Custom contracts</span>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 px-8 bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="max-w-4xl mx-auto text-center">
                    <Title level={2} className="text-white text-4xl font-bold mb-6">
                        Ready to transform your workflow?
                    </Title>
                    <Paragraph className="text-blue-100 text-xl mb-10">
                        Join thousands of teams already using AuraFlow to manage their work better
                    </Paragraph>
                    <Button
                        size="large"
                        className="h-14 px-12 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-100 border-0 shadow-xl"
                        onClick={() => navigate('/login')}
                    >
                        Get Started for Free
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
