import React from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    SafetyCertificateOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { Column, Pie, Line } from '@ant-design/charts';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../../api/dashboard.api';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchDashboardStats,
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    if (isLoading || !stats) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Prepare data for charts
    const tenantUsersData = stats.usersByTenant.map(item => ({
        tenant: item.tenantName,
        users: item.userCount,
    }));

    const userStatusData = stats.usersByStatus && stats.usersByStatus.length > 0
        ? stats.usersByStatus.map(item => ({
            type: item.status,
            value: item.count,
        }))
        : [
            { type: 'ACTIVE', value: stats.activeUsers || 65 },
            { type: 'INACTIVE', value: 20 },
            { type: 'INVITED', value: 15 },
        ];

    const columnConfig = {
        data: tenantUsersData,
        xField: 'tenant',
        yField: 'users',
        color: '#52c41a', // Green color
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
            tenant: {
                alias: 'Tenant',
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
        interactions: [
            {
                type: 'element-active',
            },
        ],
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
            <Title level={2}>Dashboard</Title>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Tenants"
                            value={stats.totalTenants}
                            prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={stats.totalUsers}
                            prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Users"
                            value={stats.activeUsers}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Roles"
                            value={stats.totalRoles}
                            prefix={<SafetyCertificateOutlined style={{ color: '#fa8c16' }} />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Users per Tenant" bordered={false}>
                        <Column {...columnConfig} />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Users by Status" bordered={false}>
                        <Pie {...pieConfig} />
                    </Card>
                </Col>
            </Row>

            {/* Additional Charts for Users by Status and Tenant Activity */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="Tenant Activity - Line Chart (Mock)" bordered={false}>
                        <Line
                            data={[
                                { month: 'Jan', activity: 120 },
                                { month: 'Feb', activity: 145 },
                                { month: 'Mar', activity: 168 },
                                { month: 'Apr', activity: 155 },
                                { month: 'May', activity: 190 },
                                { month: 'Jun', activity: 210 },
                            ]}
                            xField="month"
                            yField="activity"
                            color="#722ed1"
                            point={{
                                size: 5,
                                shape: 'circle',
                            }}
                            label={{
                                style: {
                                    fill: '#000000',
                                    opacity: 0.6,
                                },
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="User Growth (Mock)" bordered={false}>
                        <Column
                            data={[
                                { month: 'Jan', users: 45 },
                                { month: 'Feb', users: 52 },
                                { month: 'Mar', users: 61 },
                                { month: 'Apr', users: 58 },
                                { month: 'May', users: 70 },
                                { month: 'Jun', users: stats.totalUsers },
                            ]}
                            xField="month"
                            yField="users"
                            color="#1890ff"
                            label={{
                                position: 'top' as const,
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
