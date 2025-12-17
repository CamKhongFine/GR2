import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
    CheckSquareOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const DivisionDashboardPage: React.FC = () => {
    // Mock statistics for division dashboard
    const mockStats = {
        myTasks: 12,
        teamMembers: 8,
        pendingTasks: 5,
        completedThisWeek: 18,
    };

    return (
        <>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 4 }}>
                    Division Dashboard
                </Title>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="My Tasks"
                            value={mockStats.myTasks}
                            prefix={<CheckSquareOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Team Members"
                            value={mockStats.teamMembers}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Pending Tasks"
                            value={mockStats.pendingTasks}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Completed This Week"
                            value={mockStats.completedThisWeek}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card title="Division Overview">
                        <p>Welcome to the Division Dashboard. Here you can manage your tasks, coordinate with your team, and track progress.</p>
                        <p>Use the navigation menu to access division tasks and team features.</p>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default DivisionDashboardPage;
