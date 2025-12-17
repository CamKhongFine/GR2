import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
    UserOutlined,
    ApartmentOutlined,
    CheckCircleOutlined,
    BranchesOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
    // Mock data for admin dashboard
    const mockStats = {
        totalUsers: 45,
        activeUsers: 38,
        totalDivisions: 8,
        totalWorkflows: 12,
    };

    // Mock data for charts
    const usersByDivisionData = [
        { division: 'Engineering', users: 15 },
        { division: 'Marketing', users: 8 },
        { division: 'Sales', users: 12 },
        { division: 'HR', users: 5 },
        { division: 'Finance', users: 5 },
    ];

    const userStatusData = [
        { type: 'ACTIVE', value: 38 },
        { type: 'INACTIVE', value: 5 },
        { type: 'INVITED', value: 2 },
    ];

    const columnConfig = {
        data: usersByDivisionData,
        xField: 'division',
        yField: 'users',
        color: '#722ed1', // Purple color for admin
        label: {
            position: 'top' as const,
            style: {
                fill: '#000000',
                opacity: 0.6,
            },
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
        meta: {
            division: {
                alias: 'Division',
            },
            users: {
                alias: 'Number of Users',
            },
        },
    };

    const pieConfig = {
        data: userStatusData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'outer' as const,
        },
        legend: {
            position: 'bottom' as const,
        },
        color: ({ type }: { type: string }) => {
            if (type === 'ACTIVE') return '#52c41a';
            if (type === 'INACTIVE') return '#d9d9d9';
            if (type === 'INVITED') return '#1890ff';
            return '#8c8c8c';
        },
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Tenant Dashboard</Title>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={mockStats.totalUsers}
                            prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Users"
                            value={mockStats.activeUsers}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Divisions"
                            value={mockStats.totalDivisions}
                            prefix={<ApartmentOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Workflows"
                            value={mockStats.totalWorkflows}
                            prefix={<BranchesOutlined style={{ color: '#fa8c16' }} />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Users per Division" bordered={false}>
                        <Column {...columnConfig} />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Users by Status" bordered={false}>
                        <Pie {...pieConfig} />
                    </Card>
                </Col>
            </Row>

            {/* Additional Mock Charts */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="Workflow Activity (Mock)" bordered={false}>
                        <Column
                            data={[
                                { month: 'Jan', workflows: 8 },
                                { month: 'Feb', workflows: 9 },
                                { month: 'Mar', workflows: 10 },
                                { month: 'Apr', workflows: 11 },
                                { month: 'May', workflows: 11 },
                                { month: 'Jun', workflows: 12 },
                            ]}
                            xField="month"
                            yField="workflows"
                            color="#fa8c16"
                            label={{
                                position: 'top' as const,
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Division Distribution (Mock)" bordered={false}>
                        <Pie
                            data={usersByDivisionData}
                            angleField="users"
                            colorField="division"
                            radius={0.8}
                            label={{
                                type: 'outer' as const,
                            }}
                            legend={{
                                position: 'bottom' as const,
                            }}
                            color={['#722ed1', '#1890ff', '#52c41a', '#faad14', '#f5222d']}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
