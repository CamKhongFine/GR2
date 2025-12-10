import React from 'react';
import { Typography, Button, Row, Col, Card } from 'antd';
import { RocketOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

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
        text: "Antigravity",
        className: "text-blue-500 dark:text-blue-500",
    },
    {
        text: "Speed.",
        className: "text-blue-500 dark:text-blue-500",
    },
];

const LandingPage: React.FC = () => {
    return (
        <div className="flex flex-col gap-20 pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-blue-50 to-white py-20 px-8 text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <TypewriterEffectSmooth words={words} />
                    <Paragraph className="text-xl text-gray-500 mb-8">
                        The ultimate multi-tenant task management platform for modern teams.
                        Streamline workflows, collaborate in real-time, and boost productivity.
                    </Paragraph>
                    <div className="flex justify-center gap-4">
                        <Button type="primary" size="large" className="h-12 px-8 text-lg">
                            Start Free Trial
                        </Button>
                        <Button size="large" className="h-12 px-8 text-lg">
                            Watch Demo
                        </Button>
                    </div>
                    <div className="mt-16 shadow-2xl rounded-xl overflow-hidden border border-gray-200">
                        <img src="https://placehold.co/1200x600/f0f2f5/1677ff?text=Dashboard+Preview" alt="Dashboard Preview" className="w-full" />
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-6xl mx-auto px-8">
                <div className="text-center mb-16">
                    <Title level={2}>Everything you need to run your team</Title>
                    <Paragraph className="text-gray-500 text-lg">Powerful features built for scale and simplicity</Paragraph>
                </div>
                <Row gutter={[32, 32]}>
                    <Col xs={24} md={8}>
                        <Card className="h-full hover:shadow-lg transition-shadow border-gray-100">
                            <RocketOutlined className="text-4xl text-primary mb-4" />
                            <Title level={4}>Workflow Engine</Title>
                            <Paragraph>Customizable workflows that adapt to your team's unique processes and requirements.</Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="h-full hover:shadow-lg transition-shadow border-gray-100">
                            <TeamOutlined className="text-4xl text-green-500 mb-4" />
                            <Title level={4}>Real-time Collaboration</Title>
                            <Paragraph>Chat, comment, and update tasks in real-time with built-in Socket.IO integration.</Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="h-full hover:shadow-lg transition-shadow border-gray-100">
                            <SafetyCertificateOutlined className="text-4xl text-purple-500 mb-4" />
                            <Title level={4}>Enterprise Security</Title>
                            <Paragraph>Multi-tenant architecture ensures your data is isolated, secure, and always available.</Paragraph>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Pricing Section */}
            <div className="bg-gray-50 py-20 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <Title level={2}>Simple, Transparent Pricing</Title>
                    </div>
                    <Row gutter={[32, 32]} justify="center">
                        <Col xs={24} md={8}>
                            <Card className="h-full text-center hover:-translate-y-2 transition-transform duration-300">
                                <Title level={3}>Starter</Title>
                                <div className="text-4xl font-bold text-primary mb-4">$0<span className="text-lg text-gray-400 font-normal">/mo</span></div>
                                <Paragraph>For small teams getting started</Paragraph>
                                <Button block size="large">Get Started</Button>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="h-full text-center border-primary shadow-md relative hover:-translate-y-2 transition-transform duration-300">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-3 py-1 rounded-full text-sm">Popular</div>
                                <Title level={3}>Pro</Title>
                                <div className="text-4xl font-bold text-primary mb-4">$29<span className="text-lg text-gray-400 font-normal">/mo</span></div>
                                <Paragraph>For growing teams with advanced needs</Paragraph>
                                <Button type="primary" block size="large">Start Trial</Button>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="h-full text-center hover:-translate-y-2 transition-transform duration-300">
                                <Title level={3}>Enterprise</Title>
                                <div className="text-4xl font-bold text-primary mb-4">Custom</div>
                                <Paragraph>For large organizations</Paragraph>
                                <Button block size="large">Contact Sales</Button>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
