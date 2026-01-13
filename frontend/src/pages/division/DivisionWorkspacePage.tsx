import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    Tabs,
    Tag,
    Space,
    Avatar,
    Button,
    List,
    Spin,
    Empty,
} from 'antd';
import {
    RightOutlined,
    UserOutlined,
    ApartmentOutlined,
    TeamOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import WorkspaceLayout, { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import { useUserStore } from '../../store/userStore';
import { getDivisionDepartments, getDivisionMembers } from '../../api/division.api';
import type { DepartmentResponse } from '../../api/department.api';
import type { UserResponse } from '../../api/user.api';

const { Title, Text, Paragraph } = Typography;

const DivisionWorkspacePage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('departments');
    const { user } = useUserStore();

    // Get division info from user data
    const divisionId = user?.division?.id;
    const divisionName = user?.division?.name || 'Division';
    const divisionDescription = user?.division?.description || 'Manage your division departments and staff.';

    // Fetch departments in this division
    const { data: departmentsData, isLoading: deptLoading } = useQuery({
        queryKey: ['divisionDepartments', divisionId],
        queryFn: () => getDivisionDepartments(divisionId!, 0, 100),
        enabled: !!divisionId,
    });

    // Fetch members in this division
    const { data: membersData, isLoading: membersLoading } = useQuery({
        queryKey: ['divisionMembers', divisionId],
        queryFn: () => getDivisionMembers(divisionId!, 0, 100),
        enabled: !!divisionId,
    });

    const departments = departmentsData?.content || [];
    const members = membersData?.content || [];

    // Sidebar items configuration
    const sidebarItems: SidebarItemConfig[] = [
        {
            key: 'division',
            icon: <ApartmentOutlined />,
            label: 'Division',
            path: '/division/dashboard',
        },
        {
            key: 'my-tasks',
            icon: <CheckSquareOutlined />,
            label: 'My Task',
            path: '/division/my-tasks',
        },
    ];

    // Left header content - Division prominently displayed
    const leftHeaderContent = (
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 rounded-xl shadow-lg">
            <div>
                <span className="font-bold text-white text-base">{divisionName}</span>
            </div>
        </div>
    );

    const tabItems = [
        {
            key: 'departments',
            label: (
                <span className="flex items-center gap-2">
                    <ApartmentOutlined />
                    Departments ({departments.length})
                </span>
            ),
            children: deptLoading ? (
                <div className="flex justify-center py-12">
                    <Spin size="large" />
                </div>
            ) : departments.length === 0 ? (
                <Empty description="No departments found in this division" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {departments.map((dept: DepartmentResponse) => (
                        <Card
                            key={dept.id}
                            hoverable
                            className="shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50"
                            onClick={() => navigate('/department/dashboard')}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                                    <TeamOutlined className="text-white text-xl" />
                                </div>
                                <div>
                                    <Text strong className="text-base">{dept.name}</Text>
                                    <div className="text-xs text-gray-500">{dept.description || 'No description'}</div>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-end">
                                <Button type="primary" size="small" icon={<RightOutlined />} className="rounded-lg">
                                    Open Workspace
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ),
        },
        {
            key: 'staff',
            label: (
                <span className="flex items-center gap-2">
                    <UserOutlined />
                    Staff ({members.length})
                </span>
            ),
            children: membersLoading ? (
                <div className="flex justify-center py-12">
                    <Spin size="large" />
                </div>
            ) : members.length === 0 ? (
                <Empty description="No staff members found in this division" />
            ) : (
                <Card className="shadow-sm">
                    <List
                        dataSource={members}
                        renderItem={(staff: UserResponse) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src={staff.avatarUrl} icon={<UserOutlined />} />}
                                    title={`${staff.firstName || ''} ${staff.lastName || ''}`.trim() || staff.email}
                                    description={
                                        <Space>
                                            <Text type="secondary">{staff.title || 'Staff'}</Text>
                                            {staff.department && <Tag>{staff.department.name}</Tag>}
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            ),
        },
    ];

    return (
        <WorkspaceLayout
            sidebarItems={sidebarItems}
            activeItem="division"
            themeColor="blue"
            leftHeaderContent={leftHeaderContent}
        >
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <Title level={2} className="mb-2">Division Workspace</Title>
                    <Paragraph type="secondary" className="text-base max-w-2xl">
                        {divisionDescription}
                    </Paragraph>
                </div>

                {/* Tabs */}
                <Card className="shadow-sm">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={tabItems}
                        size="large"
                    />
                </Card>
            </div>
        </WorkspaceLayout>
    );
};

export default DivisionWorkspacePage;
