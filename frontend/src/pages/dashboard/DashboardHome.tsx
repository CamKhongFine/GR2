import React from 'react';
import { Typography, Row, Col, Card, Statistic, List, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';

const { Title } = Typography;

const DashboardHome: React.FC = () => {
    const data = [
        { title: 'Design System Update', deadline: 'Today', tag: 'High' },
        { title: 'Client Meeting Preparation', deadline: 'Tomorrow', tag: 'Medium' },
        { title: 'Fix Login Bug', deadline: 'Next Week', tag: 'Critical' },
    ];

    return (
        <div>
            <Title level={2}>Welcome back, John!</Title>

            <Row gutter={[16, 16]} className="mb-8">
                <Col span={8}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Tasks Completed"
                            value={12}
                            prefix={<CheckCircleOutlined className="text-green-500" />}
                            suffix="/ 20"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Pending Tasks"
                            value={8}
                            prefix={<ClockCircleOutlined className="text-orange-500" />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Urgent Issues"
                            value={2}
                            prefix={<FireOutlined className="text-red-500" />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={16}>
                    <Card title="Upcoming Tasks" bordered={false} className="shadow-sm">
                        <List
                            itemLayout="horizontal"
                            dataSource={data}
                            renderItem={(item) => (
                                <List.Item actions={[<a key="view">View</a>]}>
                                    <List.Item.Meta
                                        avatar={<ClockCircleOutlined />}
                                        title={<a href="#">{item.title}</a>}
                                        description={`Due: ${item.deadline}`}
                                    />
                                    <Tag color={item.tag === 'Critical' ? 'red' : item.tag === 'High' ? 'orange' : 'blue'}>
                                        {item.tag}
                                    </Tag>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Timesheet" bordered={false} className="shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span>Mon</span>
                                <div className="w-32 h-2 bg-gray-100 rounded overflow-hidden">
                                    <div className="h-full bg-primary w-3/4"></div>
                                </div>
                                <span>6h</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Tue</span>
                                <div className="w-32 h-2 bg-gray-100 rounded overflow-hidden">
                                    <div className="h-full bg-primary w-full"></div>
                                </div>
                                <span>8h</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Wed</span>
                                <div className="w-32 h-2 bg-gray-100 rounded overflow-hidden">
                                    <div className="h-full bg-primary w-1/2"></div>
                                </div>
                                <span>4h</span>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardHome;
