import React, { useState, useMemo } from 'react';
import {
    Drawer,
    Steps,
    Card,
    List,
    Typography,
    Space,
    Button,
    Modal,
    Form,
    Select,
    Descriptions,
    Tag,
    Avatar,
    Empty,
    Spin,
    message,
} from 'antd';
import {
    CheckOutlined,
    FileTextOutlined,
    SettingOutlined,
    WarningOutlined,
    UserOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
    fetchWorkflows,
    getWorkflowById,
    WorkflowResponse,
    WorkflowDetailResponse,
    WorkflowStepResponse,
    AssigneeType,
} from '../../api/workflow.api';
import { fetchUsers, UserResponse } from '../../api/user.api';
import { fetchTenantDepartments, DepartmentResponse } from '../../api/department.api';
import { fetchRoles, RoleResponse } from '../../api/role.api';
import { PagedResponse } from '../../api/workflow.api';
import WorkflowCanvas from '../workflow/WorkflowCanvas';
import { ProjectResponse } from '../../api/project.api';

const { Title, Text } = Typography;
const { Step } = Steps;

interface CreateTaskDrawerProps {
    open: boolean;
    onClose: () => void;
    project: ProjectResponse;
    onSuccess?: () => void;
}

interface StepAssignment {
    stepId: number;
    assigneeType: 'USER' | 'ROLE' | 'DEPARTMENT';
    assigneeId: number;
    assigneeName: string;
}

const CreateTaskDrawer: React.FC<CreateTaskDrawerProps> = ({
    open,
    onClose,
    project,
    onSuccess,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);
    const [stepAssignments, setStepAssignments] = useState<Map<number, StepAssignment>>(new Map());
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
    const [form] = Form.useForm();

    // Fetch workflows
    const { data: workflowsData, isLoading: workflowsLoading } = useQuery({
        queryKey: ['workflows-for-task-creation'],
        queryFn: () => fetchWorkflows(0, 100),
    });

    // Fetch selected workflow details
    const { data: workflowDetail, isLoading: workflowDetailLoading } = useQuery({
        queryKey: ['workflow-detail', selectedWorkflowId],
        queryFn: () => getWorkflowById(selectedWorkflowId!),
        enabled: !!selectedWorkflowId,
    });

    // Fetch users for assignment
    const { data: usersData } = useQuery({
        queryKey: ['users-for-assignment', project.departmentId],
        queryFn: () => fetchUsers(0, 100, undefined, undefined, 'ACTIVE', undefined, undefined, project.departmentId),
        enabled: !!project.departmentId,
    });

    // Fetch departments for assignment
    const { data: departmentsData } = useQuery({
        queryKey: ['departments-for-assignment'],
        queryFn: () => fetchTenantDepartments(0, 100),
    });

    // Fetch roles for assignment
    const { data: rolesData } = useQuery({
        queryKey: ['roles-for-assignment'],
        queryFn: () => fetchRoles(0, 100),
    });

    const workflows = workflowsData?.content || [];
    const users = usersData?.content || [];
    const departments = departmentsData?.content || [];
    const roles = rolesData?.content || [];

    const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId);

    const handleWorkflowSelect = (workflowId: number) => {
        setSelectedWorkflowId(workflowId);
        setCurrentStep(1);
        setStepAssignments(new Map());
    };

    const handleNodeClick = (nodeId: string) => {
        if (!workflowDetail) return;
        const step = workflowDetail.steps.find((s) => s.id.toString() === nodeId);
        if (!step) return;

        if (step.type === 'START' || step.type === 'END') {
            message.info('START and END steps do not require assignment configuration');
            return;
        }

        setSelectedNodeId(nodeId);
        setIsNodeConfigOpen(true);

        const existingAssignment = stepAssignments.get(step.id);
        form.setFieldsValue({
            assigneeId: existingAssignment?.assigneeId || undefined,
        });
    };

    const handleAssignmentSave = () => {
        if (!workflowDetail || !selectedNodeId) return;

        const step = workflowDetail.steps.find((s) => s.id.toString() === selectedNodeId);
        if (!step) return;

        form.validateFields().then((values) => {
            const user = users.find((u) => u.id === values.assigneeId);
            const assigneeName =
                user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : '';

            const assignment: StepAssignment = {
                stepId: step.id,
                assigneeType: 'USER',
                assigneeId: values.assigneeId,
                assigneeName,
            };

            setStepAssignments(new Map(stepAssignments.set(step.id, assignment)));
            setIsNodeConfigOpen(false);
            form.resetFields();
            message.success('Assignment configured');
        });
    };

    const handleCreateTask = async () => {
        if (!workflowDetail) return;

        const configurableSteps = workflowDetail.steps.filter(
            (s) => s.type !== 'START' && s.type !== 'END'
        );

        const missingAssignments = configurableSteps.filter(
            (s) => s.assigneeType === 'DYNAMIC' && !stepAssignments.has(s.id)
        );

        if (missingAssignments.length > 0) {
            message.error(
                `Please configure assignments for: ${missingAssignments.map((s) => s.name).join(', ')}`
            );
            return;
        }

        try {
            message.success('Task created successfully');
            onSuccess?.();
            handleClose();
        } catch (error) {
            message.error('Failed to create task');
        }
    };

    const handleClose = () => {
        setCurrentStep(0);
        setSelectedWorkflowId(null);
        setStepAssignments(new Map());
        setSelectedNodeId(null);
        setIsNodeConfigOpen(false);
        form.resetFields();
        onClose();
    };

    const selectedStep = workflowDetail?.steps.find((s) => s.id.toString() === selectedNodeId);

    return (
        <>
            <Drawer
                title="Create Task"
                width={currentStep === 1 ? 1200 : 600}
                open={open}
                onClose={handleClose}
                footer={null}
            >
                <Steps current={currentStep} style={{ marginBottom: 32 }}>
                    <Step title="Select Workflow" icon={<FileTextOutlined />} />
                    <Step title="Configure Task" icon={<SettingOutlined />} />
                    <Step title="Confirm" icon={<CheckOutlined />} />
                </Steps>

                {/* Step 1: Select Workflow */}
                {currentStep === 0 && (
                    <div>
                        <Title level={4} style={{ marginBottom: 16 }}>
                            Select Workflow Template
                        </Title>
                        <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
                            Choose a workflow template to create a task instance
                        </Text>

                        {workflowsLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <Spin size="large" />
                            </div>
                        ) : workflows.length === 0 ? (
                            <Empty description="No workflows available" />
                        ) : (
                            <List
                                dataSource={workflows}
                                renderItem={(workflow) => (
                                    <List.Item
                                        style={{
                                            cursor: 'pointer',
                                            padding: 16,
                                            borderRadius: 8,
                                            border: selectedWorkflowId === workflow.id ? '2px solid #1890ff' : '1px solid #e5e7eb',
                                            marginBottom: 12,
                                            backgroundColor: selectedWorkflowId === workflow.id ? '#f0f5ff' : '#ffffff',
                                        }}
                                        onClick={() => handleWorkflowSelect(workflow.id)}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <Space>
                                                    <Text strong>{workflow.name}</Text>
                                                    {workflow.isActive ? (
                                                        <Tag color="green">Active</Tag>
                                                    ) : (
                                                        <Tag color="default">Inactive</Tag>
                                                    )}
                                                </Space>
                                            }
                                            description={
                                                <div>
                                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                                        {workflow.description || 'No description'}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                        <Button type="primary" onClick={(e) => { e.stopPropagation(); handleWorkflowSelect(workflow.id); }}>
                                            Select
                                        </Button>
                                    </List.Item>
                                )}
                            />
                        )}
                    </div>
                )}

                {/* Step 2: Configure Assignments */}
                {currentStep === 1 && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <Title level={4} style={{ marginBottom: 8 }}>
                                Configure Task Assignments
                            </Title>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                Click on workflow steps to configure assignees. START and END steps are read-only.
                            </Text>
                        </div>

                        {workflowDetailLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <Spin size="large" />
                            </div>
                        ) : workflowDetail ? (
                            <div style={{ height: 600, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                                <WorkflowCanvas
                                    initialSteps={workflowDetail.steps}
                                    initialTransitions={workflowDetail.transitions}
                                    readOnly={true}
                                    onNodeClick={handleNodeClick}
                                />
                            </div>
                        ) : (
                            <Empty description="No workflow selected" />
                        )}

                        <div style={{ marginTop: 16 }}>
                            <Button onClick={() => setCurrentStep(0)} style={{ marginRight: 8 }}>
                                Back
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => setCurrentStep(2)}
                                disabled={!workflowDetail}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirm & Create */}
                {currentStep === 2 && workflowDetail && (() => {
                    const stepsRequiringAssignment = workflowDetail.steps.filter(
                        (s) => s.type !== 'START' && s.type !== 'END' && s.assigneeType === 'DYNAMIC'
                    );

                    const unassignedSteps = stepsRequiringAssignment.filter(
                        (s) => !stepAssignments.has(s.id)
                    );

                    const isReady = unassignedSteps.length === 0;

                    return (
                        <div>
                            <div style={{ marginBottom: 32 }}>
                                <Text strong style={{ fontSize: 16 }}>{workflowDetail.name}</Text>
                            </div>

                            {stepsRequiringAssignment.length > 0 && (
                                <div style={{ marginBottom: 32 }}>
                                    {stepsRequiringAssignment.map((step) => {
                                        const assignment = stepAssignments.get(step.id);
                                        const isUnassigned = !assignment;

                                        const isMultiple = assignment && (assignment.assigneeType === 'ROLE' || assignment.assigneeType === 'DEPARTMENT');

                                        return (
                                            <div
                                                key={step.id}
                                                style={{
                                                    padding: 16,
                                                    marginBottom: 12,
                                                    borderRadius: 8,
                                                    border: isUnassigned ? '1px solid #ff7875' : '1px solid #e5e7eb',
                                                    backgroundColor: isUnassigned ? '#fff2f0' : '#f6ffed',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                }}
                                            >
                                                {isUnassigned ? (
                                                    <WarningOutlined style={{ color: '#ff7875', fontSize: 18 }} />
                                                ) : isMultiple ? (
                                                    <TeamOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                                                ) : (
                                                    <UserOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <Text strong={isUnassigned} style={{ fontSize: 14 }}>
                                                        {step.name}
                                                    </Text>
                                                    {isUnassigned && (
                                                        <div style={{ marginTop: 4 }}>
                                                            <Text type="secondary" style={{ fontSize: 12, color: '#ff7875' }}>
                                                                Assignment required
                                                            </Text>
                                                        </div>
                                                    )}
                                                    {assignment && (
                                                        <div style={{ marginTop: 4 }}>
                                                            <Text strong style={{ fontSize: 12, color: '#52c41a' }}>
                                                                {assignment.assigneeName}
                                                            </Text>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Button onClick={() => setCurrentStep(1)}>
                                    Back
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={handleCreateTask}
                                    disabled={!isReady}
                                >
                                    Create Task
                                </Button>
                            </div>
                        </div>
                    );
                })()}
            </Drawer>

            {/* Node Configuration Modal */}
            <Modal
                title={selectedStep ? `Configure: ${selectedStep.name}` : 'Configure Step'}
                open={isNodeConfigOpen}
                onOk={handleAssignmentSave}
                onCancel={() => {
                    setIsNodeConfigOpen(false);
                    form.resetFields();
                }}
                okText="Save Assignment"
                width={500}
                centered
                style={{ marginLeft: 'calc(100vw - 1200px)' }}
            >
                {selectedStep && (
                    <div>
                        {selectedStep.assigneeType === 'DYNAMIC' && (
                            <Form form={form} layout="vertical">
                                <Form.Item
                                    name="assigneeId"
                                    label="Select User"
                                    rules={[{ required: true, message: 'Please select a user' }]}
                                >
                                    <Select
                                        placeholder="Select user"
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {users.map((user) => (
                                            <Select.Option
                                                key={user.id}
                                                value={user.id}
                                                label={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                                            >
                                                <Space>
                                                    <Avatar size="small" src={user.avatarUrl}>
                                                        {user.firstName?.charAt(0) || user.email.charAt(0)}
                                                    </Avatar>
                                                    <span>
                                                        {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                                                    </span>
                                                </Space>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Form>
                        )}

                        {selectedStep.assigneeType === 'FIXED' && (
                            <div style={{ padding: 16, backgroundColor: '#f9fafb', borderRadius: 8 }}>
                                <Text type="secondary">
                                    This step has a fixed assignee configured in the workflow template and cannot be changed.
                                </Text>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default CreateTaskDrawer;
