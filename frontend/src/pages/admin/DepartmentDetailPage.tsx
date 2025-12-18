import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Button,
    Space,
    Typography,
    message,
    Modal,
    Select,
    Dropdown,
    Tag,
    Input,
    Avatar,
    Tabs,
} from 'antd';
import type { TabsProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    ArrowLeftOutlined,
    PlusOutlined,
    MoreOutlined,
    DeleteOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getDepartmentById,
    getDepartmentMembers,
    assignMemberToDepartment,
    removeMemberFromDepartment,
    getAvailableUsersForDepartment,
} from '../../api/department.api';
import { UserResponse } from '../../api/user.api';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../config/date.config';

const { Title, Text } = Typography;

const DepartmentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const departmentId = parseInt(id || '0');

    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState('');

    // Pagination state
    const [membersPage, setMembersPage] = useState(0);
    const [membersPageSize, setMembersPageSize] = useState(10);

    // Fetch department details
    const { data: department, isLoading: isDepartmentLoading } = useQuery({
        queryKey: ['department', departmentId],
        queryFn: () => getDepartmentById(departmentId),
        enabled: !!departmentId,
    });

    // Fetch members in this department
    const { data: membersData, isLoading: isMembersLoading } = useQuery({
        queryKey: ['department-members', departmentId, membersPage, membersPageSize, searchText],
        queryFn: () => getDepartmentMembers(departmentId, membersPage, membersPageSize, searchText),
        enabled: !!departmentId,
    });

    // Fetch available users (in same division but no department)
    const { data: availableUsersData } = useQuery({
        queryKey: ['available-users-department', departmentId],
        queryFn: () => getAvailableUsersForDepartment(departmentId),
        enabled: isAddMemberModalOpen && !!departmentId,
    });

    const members = membersData?.content || [];
    const availableUsers = availableUsersData?.content || [];

    // Mutations
    const assignMemberMutation = useMutation({
        mutationFn: (userId: number) => assignMemberToDepartment(departmentId, userId),
        onSuccess: () => {
            message.success('Member assigned successfully');
            queryClient.invalidateQueries({ queryKey: ['department-members'] });
            queryClient.invalidateQueries({ queryKey: ['available-users-department'] });
            setIsAddMemberModalOpen(false);
            setSelectedUserId(null);
        },
        onError: () => {
            message.error('Failed to assign member');
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: number) => removeMemberFromDepartment(departmentId, userId),
        onSuccess: () => {
            message.success('Member removed successfully');
            queryClient.invalidateQueries({ queryKey: ['department-members'] });
            queryClient.invalidateQueries({ queryKey: ['available-users-department'] });
        },
        onError: () => {
            message.error('Failed to remove member');
        },
    });

    const handleAssignMember = () => {
        if (selectedUserId) {
            assignMemberMutation.mutate(selectedUserId);
        }
    };

    const handleRemoveMember = (userId: number) => {
        Modal.confirm({
            title: 'Remove Member',
            content: 'Are you sure you want to remove this member from the department?',
            onOk: () => removeMemberMutation.mutate(userId),
        });
    };

    const memberColumns: ColumnsType<UserResponse> = [
        {
            title: 'User',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
            render: (email: string, record) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} src={record.avatarUrl} />
                    <div>
                        <div>{record.firstName && record.lastName ? `${record.firstName} ${record.lastName}` : 'N/A'}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {email}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (title: string) => title || 'N/A',
        },
        {
            title: 'Last Update',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 200,
            sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
            render: (date: string) => dayjs(date).format(DATE_FORMAT),
        },
        {
            title: 'Division',
            key: 'division',
            render: (_, record) => (
                record.division ? (
                    <Tag color="blue">{record.division.name}</Tag>
                ) : (
                    <Text type="secondary">No division</Text>
                )
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'remove',
                                label: 'Remove',
                                icon: <DeleteOutlined />,
                                danger: true,
                                onClick: () => handleRemoveMember(record.id),
                            },
                        ],
                    }}
                    trigger={['click']}
                >
                    <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                    {department?.name || 'Loading...'}
                </Title>
            </div>

            <Card>
                <Tabs defaultActiveKey="members">
                    <Tabs.TabPane tab="Members" key="members">
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Input
                                placeholder="Search by email or name"
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 300 }}
                                allowClear
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsAddMemberModalOpen(true)}
                            >
                                Add Member
                            </Button>
                        </div>
                        <Table
                            columns={memberColumns}
                            dataSource={members}
                            rowKey="id"
                            loading={isMembersLoading}
                            pagination={{
                                current: membersPage + 1,
                                pageSize: membersPageSize,
                                total: membersData?.totalElements || 0,
                                showSizeChanger: true,
                                onChange: (page, pageSize) => {
                                    setMembersPage(page - 1);
                                    setMembersPageSize(pageSize);
                                },
                            }}
                        />
                    </Tabs.TabPane>
                </Tabs>
            </Card>

            <div style={{ marginTop: 16 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin/departments')}
                >
                    Back
                </Button>
            </div>

            {/* Add Member Modal */}
            <Modal
                title="Add Member to Department"
                open={isAddMemberModalOpen}
                onOk={handleAssignMember}
                onCancel={() => {
                    setIsAddMemberModalOpen(false);
                    setSelectedUserId(null);
                }}
                confirmLoading={assignMemberMutation.isPending}
                okButtonProps={{ disabled: !selectedUserId }}
            >
                <div style={{ marginTop: 20 }}>
                    <Text>Select a user from the same division to add to this department:</Text>
                    <Select
                        style={{ width: '100%', marginTop: 12 }}
                        placeholder="Select user"
                        value={selectedUserId}
                        onChange={setSelectedUserId}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={availableUsers.map(user => ({
                            value: user.id,
                            label: `${user.firstName || ''} ${user.lastName || ''} (${user.email})`.trim(),
                        }))}
                    />
                    {availableUsers.length === 0 && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                            No available users
                        </Text>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default DepartmentDetailPage;
