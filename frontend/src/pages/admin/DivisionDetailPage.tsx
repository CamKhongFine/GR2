import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Tabs,
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
} from 'antd';
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
    getDivisionById,
    assignDepartmentToDivision,
    removeDepartmentFromDivision,
    assignMemberToDivision,
    removeMemberFromDivision,
    getDivisionDepartments,
    getDivisionMembers,
    DivisionResponse,
} from '../../api/division.api';
import { fetchTenantDepartments, DepartmentResponse } from '../../api/department.api';
import { fetchUsers, UserResponse } from '../../api/user.api';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../config/date.config';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DivisionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const divisionId = parseInt(id || '0');

    const [activeTab, setActiveTab] = useState('departments');
    const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);
    const [searchText, setSearchText] = useState('');

    // Pagination state
    const [departmentsPage, setDepartmentsPage] = useState(0);
    const [departmentsPageSize, setDepartmentsPageSize] = useState(10);
    const [membersPage, setMembersPage] = useState(0);
    const [membersPageSize, setMembersPageSize] = useState(10);

    // Fetch division details
    const { data: division, isLoading: isDivisionLoading } = useQuery({
        queryKey: ['division', divisionId],
        queryFn: () => getDivisionById(divisionId),
        enabled: !!divisionId,
    });

    // Fetch departments in this division
    const { data: departmentsData, isLoading: isDepartmentsLoading } = useQuery({
        queryKey: ['division-departments', divisionId, departmentsPage, departmentsPageSize],
        queryFn: () => getDivisionDepartments(divisionId, departmentsPage, departmentsPageSize),
        enabled: !!divisionId,
    });

    // Fetch available departments (not assigned to any division)
    const { data: availableDepartmentsData } = useQuery({
        queryKey: ['available-departments'],
        queryFn: () => fetchTenantDepartments(0, 100, null), // null means no division
        enabled: isAddDepartmentModalOpen,
    });

    // Fetch members in this division
    const { data: membersData, isLoading: isMembersLoading } = useQuery({
        queryKey: ['division-members', divisionId, membersPage, membersPageSize, departmentFilter, searchText],
        queryFn: () => getDivisionMembers(divisionId, membersPage, membersPageSize, departmentFilter, searchText),
        enabled: !!divisionId && activeTab === 'members',
    });

    // Fetch available users (not assigned to any division)
    const { data: availableUsersData } = useQuery({
        queryKey: ['available-users'],
        queryFn: () => fetchUsers(0, 100, undefined, undefined, undefined, undefined, null), // null means no division
        enabled: isAddMemberModalOpen,
    });

    // Fetch all departments for filter
    const { data: allDepartmentsData } = useQuery({
        queryKey: ['all-departments'],
        queryFn: () => fetchTenantDepartments(0, 100),
    });

    const departments = departmentsData?.content || [];
    const availableDepartments = availableDepartmentsData?.content || [];
    const members = membersData?.content || [];
    const availableUsers = availableUsersData?.content || [];
    const allDepartments = allDepartmentsData?.content || [];

    // Mutations
    const assignDepartmentMutation = useMutation({
        mutationFn: (departmentId: number) => assignDepartmentToDivision(divisionId, departmentId),
        onSuccess: () => {
            message.success('Department assigned successfully');
            queryClient.invalidateQueries({ queryKey: ['division-departments'] });
            queryClient.invalidateQueries({ queryKey: ['available-departments'] });
            setIsAddDepartmentModalOpen(false);
            setSelectedDepartmentId(null);
        },
        onError: () => {
            message.error('Failed to assign department');
        },
    });

    const removeDepartmentMutation = useMutation({
        mutationFn: (departmentId: number) => removeDepartmentFromDivision(divisionId, departmentId),
        onSuccess: () => {
            message.success('Department removed successfully');
            queryClient.invalidateQueries({ queryKey: ['division-departments'] });
            queryClient.invalidateQueries({ queryKey: ['available-departments'] });
        },
        onError: () => {
            message.error('Failed to remove department');
        },
    });

    const assignMemberMutation = useMutation({
        mutationFn: (userId: number) => assignMemberToDivision(divisionId, userId),
        onSuccess: () => {
            message.success('Member assigned successfully');
            queryClient.invalidateQueries({ queryKey: ['division-members'] });
            queryClient.invalidateQueries({ queryKey: ['available-users'] });
            setIsAddMemberModalOpen(false);
            setSelectedUserId(null);
        },
        onError: () => {
            message.error('Failed to assign member');
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: number) => removeMemberFromDivision(divisionId, userId),
        onSuccess: () => {
            message.success('Member removed successfully');
            queryClient.invalidateQueries({ queryKey: ['division-members'] });
            queryClient.invalidateQueries({ queryKey: ['available-users'] });
        },
        onError: () => {
            message.error('Failed to remove member');
        },
    });

    const handleAssignDepartment = () => {
        if (selectedDepartmentId) {
            assignDepartmentMutation.mutate(selectedDepartmentId);
        }
    };

    const handleRemoveDepartment = (departmentId: number) => {
        Modal.confirm({
            title: 'Remove Department',
            content: 'Are you sure you want to remove this department from the division?',
            onOk: () => removeDepartmentMutation.mutate(departmentId),
        });
    };

    const handleAssignMember = () => {
        if (selectedUserId) {
            assignMemberMutation.mutate(selectedUserId);
        }
    };

    const handleRemoveMember = (userId: number) => {
        Modal.confirm({
            title: 'Remove Member',
            content: 'Are you sure you want to remove this member from the division?',
            onOk: () => removeMemberMutation.mutate(userId),
        });
    };

    const departmentColumns: ColumnsType<DepartmentResponse> = [
        {
            title: 'Department Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (desc: string) => desc || 'N/A',
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 200,
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (date: string) => dayjs(date).format(DATE_FORMAT),
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
                                onClick: () => handleRemoveDepartment(record.id),
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
            title: 'Department',
            key: 'department',
            render: (_, record) => (
                record.department ? (
                    <Tag color="blue">{record.department.name}</Tag>
                ) : (
                    <Text type="secondary">No department</Text>
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
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>
                    {division?.name || 'Division Details'}
                </Title>
                {activeTab === 'members' && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddMemberModalOpen(true)}
                    >
                        Add Member
                    </Button>
                )}
            </div>

            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Departments" key="departments">
                        <Table
                            columns={departmentColumns}
                            dataSource={departments}
                            rowKey="id"
                            loading={isDepartmentsLoading}
                            pagination={{
                                current: departmentsPage + 1,
                                pageSize: departmentsPageSize,
                                total: departmentsData?.totalElements || 0,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} departments`,
                                onChange: (page, pageSize) => {
                                    setDepartmentsPage(page - 1);
                                    setDepartmentsPageSize(pageSize);
                                },
                            }}
                        />
                    </TabPane>

                    <TabPane tab="Members" key="members">
                        <div style={{ marginBottom: 16 }}>
                            <Space>
                                <Input
                                    placeholder="Search by email"
                                    prefix={<SearchOutlined />}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    style={{ width: 250 }}
                                    allowClear
                                />
                                <Select
                                    placeholder="Filter by department"
                                    value={departmentFilter}
                                    onChange={setDepartmentFilter}
                                    style={{ width: 200 }}
                                    allowClear
                                >
                                    {allDepartments.map(dept => (
                                        <Select.Option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Space>
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
                                showTotal: (total) => `Total ${total} members`,
                                onChange: (page, pageSize) => {
                                    setMembersPage(page - 1);
                                    setMembersPageSize(pageSize);
                                },
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            <div style={{ marginTop: 16 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin/divisions')}
                >
                    Back
                </Button>
            </div>

            {/* Add Department Modal */}
            <Modal
                title="Add Department to Division"
                open={isAddDepartmentModalOpen}
                onOk={handleAssignDepartment}
                onCancel={() => {
                    setIsAddDepartmentModalOpen(false);
                    setSelectedDepartmentId(null);
                }}
                confirmLoading={assignDepartmentMutation.isPending}
                okButtonProps={{ disabled: !selectedDepartmentId }}
            >
                <div style={{ marginTop: 20 }}>
                    <Text>Select a department to add to this division:</Text>
                    <Select
                        style={{ width: '100%', marginTop: 12 }}
                        placeholder="Select department"
                        value={selectedDepartmentId}
                        onChange={setSelectedDepartmentId}
                        showSearch
                        optionFilterProp="children"
                    >
                        {availableDepartments.map(dept => (
                            <Select.Option key={dept.id} value={dept.id}>
                                {dept.name}
                            </Select.Option>
                        ))}
                    </Select>
                    {availableDepartments.length === 0 && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                            No available departments. All departments are already assigned to divisions.
                        </Text>
                    )}
                </div>
            </Modal>

            {/* Add Member Modal */}
            <Modal
                title="Add Member to Division"
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
                    <Text>Select a user to add to this division:</Text>
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
                            No available users. All users are already assigned to divisions.
                        </Text>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default DivisionDetailPage;
