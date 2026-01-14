import React, { useState } from 'react';
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
    Input,
    DatePicker,
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
    EditOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchWorkflows,
    getWorkflowById,
} from '../../api/workflow.api';
import { fetchUsers } from '../../api/user.api';
import { createTask, CreateTaskRequest, TaskPriority, StepAssignment } from '../../api/task.api';
import WorkflowCanvas from '../workflow/WorkflowCanvas';
import { ProjectResponse } from '../../api/project.api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

interface CreateTaskDrawerProps {
    open: boolean;
    onClose: () => void;
    project: ProjectResponse;
    onSuccess?: () => void;
}

interface LocalStepAssignment {
    stepId: number;
    assigneeType: 'USER' | 'ROLE' | 'DEPARTMENT';
    assigneeId: number;
    assigneeName: string;
    priority?: TaskPriority;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'LOW', label: 'Low', color: 'default' },
    { value: 'NORMAL', label: 'Normal', color: 'blue' },
    { value: 'HIGH', label: 'High', color: 'red' },
];

const CreateTaskDrawer: React.FC<CreateTaskDrawerProps> = ({
    open,
    onClose,
    project,
    onSuccess,
}) => {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);
    const [stepAssignments, setStepAssignments] = useState<Map<number, LocalStepAssignment>>(new Map());
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
    const [confirmedTaskValues, setConfirmedTaskValues] = useState<any>(null);
    const [form] = Form.useForm();
    const [taskForm] = Form.useForm();

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


    // Create task mutation
    const createTaskMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            message.success('Request created successfully');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            onSuccess?.();
            handleClose();
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to create request');
        },
    });

    const workflows = workflowsData?.content || [];
    const users = usersData?.content || [];

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
            priority: existingAssignment?.priority || undefined,
        });
    };

    const handleAssignmentSave = () => {
        if (!workflowDetail || !selectedNodeId) return;

        const step = workflowDetail.steps.find((s) => s.id.toString() === selectedNodeId);
        if (!step) return;

        form.validateFields().then((values) => {
            if (step.assigneeType === 'DYNAMIC') {
                // For DYNAMIC steps, assigneeId is required
                if (!values.assigneeId) {
                    message.error('Please select a user');
                    return;
                }
                const user = users.find((u) => u.id === values.assigneeId);
                const assigneeName =
                    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : '';

                const assignment: LocalStepAssignment = {
                    stepId: step.id,
                    assigneeType: 'USER',
                    assigneeId: values.assigneeId,
                    assigneeName,
                    priority: values.priority,
                };

                setStepAssignments(new Map(stepAssignments.set(step.id, assignment)));
            } else if (step.assigneeType === 'FIXED') {
                // For FIXED steps, only priority is needed
                const assignment: LocalStepAssignment = {
                    stepId: step.id,
                    assigneeType: 'USER',
                    assigneeId: step.assigneeValue ? parseInt(step.assigneeValue) : 0,
                    assigneeName: step.assigneeName || 'Fixed Assignee',
                    priority: values.priority,
                };

                setStepAssignments(new Map(stepAssignments.set(step.id, assignment)));
            }

            setIsNodeConfigOpen(false);
            form.resetFields();
            message.success('Assignment configured');
        }).catch(() => {
            // Validation failed
        });
    };

    const handleCreateTask = async () => {
        if (!workflowDetail || !selectedWorkflowId || !confirmedTaskValues) return;

        // Convert stepAssignments Map to array for API
        const stepAssignmentsArray: StepAssignment[] = Array.from(stepAssignments.values())
            .filter((assignment: LocalStepAssignment) => {
                // Include DYNAMIC steps (with assignee) and FIXED steps (with priority)
                const step = workflowDetail.steps.find(s => s.id === assignment.stepId);
                if (!step) return false;
                if (step.assigneeType === 'DYNAMIC') {
                    return true; // DYNAMIC steps need assignee
                }
                if (step.assigneeType === 'FIXED' && assignment.priority) {
                    return true; // FIXED steps only need priority
                }
                return false;
            })
            .map((assignment: LocalStepAssignment) => {
                const step = workflowDetail.steps.find(s => s.id === assignment.stepId);
                // For FIXED steps, get assigneeId from step's assigneeValue
                if (step?.assigneeType === 'FIXED' && step.assigneeValue) {
                    return {
                        workflowStepId: assignment.stepId,
                        assigneeId: parseInt(step.assigneeValue) || 0,
                        priority: assignment.priority,
                    };
                }
                return {
                    workflowStepId: assignment.stepId,
                    assigneeId: assignment.assigneeId,
                    priority: assignment.priority,
                };
            });

        const request: CreateTaskRequest = {
            projectId: project.id,
            workflowId: selectedWorkflowId,
            title: confirmedTaskValues.title,
            description: confirmedTaskValues.description,
            priority: confirmedTaskValues.priority,
            beginDate: confirmedTaskValues.beginDate ? confirmedTaskValues.beginDate.toISOString() : undefined,
            endDate: confirmedTaskValues.endDate ? confirmedTaskValues.endDate.toISOString() : undefined,
            stepAssignments: stepAssignmentsArray.length > 0 ? stepAssignmentsArray : undefined,
        };

        createTaskMutation.mutate(request);
    };

    const handleClose = () => {
        setCurrentStep(0);
        setSelectedWorkflowId(null);
        setStepAssignments(new Map());
        setSelectedNodeId(null);
        setIsNodeConfigOpen(false);
        setConfirmedTaskValues(null);
        form.resetFields();
        taskForm.resetFields();
        onClose();
    };

    const selectedStep = workflowDetail?.steps.find((s) => s.id.toString() === selectedNodeId);

    // Calculate drawer width based on step
    const getDrawerWidth = () => {
        if (currentStep === 1) return 1200; // Config assignments step
        return 1000; // All other steps
    };

    return (
        <>
            <Drawer
                title="Create Request"
                width={getDrawerWidth()}
                open={open}
                onClose={handleClose}
                footer={null}
            >
                <Steps current={currentStep} style={{ marginBottom: 32 }}>
                    <Step title="Select Workflow" icon={<FileTextOutlined />} />
                    <Step title="Configure" icon={<SettingOutlined />} />
                    <Step title="Information" icon={<EditOutlined />} />
                    <Step title="Confirm" icon={<CheckOutlined />} />
                </Steps>

                {/* Step 1: Select Workflow */}
                {currentStep === 0 && (
                    <div>
                        <Title level={4} style={{ marginBottom: 16 }}>
                            Select Workflow Template
                        </Title>
                        <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
                            Choose a workflow template to create a request instance
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
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                Click on workflow steps to configure assignees. START and END steps are read-only.
                            </Text>
                        </div>

                        {workflowDetailLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <Spin size="large" />
                            </div>
                        ) : workflowDetail ? (
                            <div style={{ height: 500, border: '1px solid #e5e7eb', borderRadius: 8 }}>
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

                {/* Step 3: Request Details */}
                {currentStep === 2 && (
                    <div>

                        <Form
                            form={taskForm}
                            layout="vertical"
                            initialValues={{ priority: 'NORMAL' }}
                        >
                            <Form.Item
                                name="title"
                                label="Title"
                                rules={[{ required: true, message: 'Please enter a title' }]}
                            >
                                <Input placeholder="Enter title" />
                            </Form.Item>

                            <Form.Item
                                name="description"
                                label="Description"
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Enter request description (optional)"
                                />
                            </Form.Item>

                            <Form.Item
                                name="priority"
                                label="Priority"
                            >
                                <Select>
                                    {PRIORITY_OPTIONS.map((option) => (
                                        <Select.Option key={option.value} value={option.value}>
                                            <Tag color={option.color}>{option.label}</Tag>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <div style={{ display: 'flex', gap: 16 }}>
                                <Form.Item
                                    name="beginDate"
                                    label="Start Date"
                                    style={{ flex: 1 }}
                                    rules={[{ required: true, message: 'Please select a start date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>

                                <Form.Item
                                    name="endDate"
                                    label="Due Date"
                                    style={{ flex: 1 }}
                                    rules={[{ required: true, message: 'Please select a due date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </div>
                        </Form>

                        <div style={{ marginTop: 24 }}>
                            <Button onClick={() => setCurrentStep(1)} style={{ marginRight: 8 }}>
                                Back
                            </Button>
                            <Button
                                type="primary"
                                onClick={async () => {
                                    try {
                                        const values = await taskForm.validateFields();
                                        setConfirmedTaskValues(values);
                                        setCurrentStep(3);
                                    } catch {
                                        // validation failed
                                    }
                                }}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirm & Create */}
                {currentStep === 3 && workflowDetail && (() => {
                    const stepsRequiringAssignment = workflowDetail.steps.filter(
                        (s) => s.type !== 'START' && s.type !== 'END' && s.assigneeType === 'DYNAMIC'
                    );

                    const unassignedSteps = stepsRequiringAssignment.filter(
                        (s) => !stepAssignments.has(s.id)
                    );

                    const isReady = unassignedSteps.length === 0;
                    const taskValues = confirmedTaskValues || {};

                    return (
                        <div>
                            <Card size="small" style={{ marginBottom: 16 }}>
                                <div style={{ marginBottom: 12 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>WORKFLOW</Text>
                                    <div><Text strong>{workflowDetail.name}</Text></div>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>REQUEST TITLE</Text>
                                    <div><Text strong>{taskValues.title}</Text></div>
                                </div>
                                {taskValues.description && (
                                    <div style={{ marginBottom: 12 }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>DESCRIPTION</Text>
                                        <div><Text>{taskValues.description}</Text></div>
                                    </div>
                                )}
                                <div style={{ marginBottom: 12 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>PRIORITY</Text>
                                    <div>
                                        <Tag color={PRIORITY_OPTIONS.find(p => p.value === taskValues.priority)?.color}>
                                            {PRIORITY_OPTIONS.find(p => p.value === taskValues.priority)?.label}
                                        </Tag>
                                    </div>
                                </div>
                                {(taskValues.beginDate || taskValues.endDate) && (
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>DATES</Text>
                                        <div>
                                            {taskValues.beginDate && <Text>{dayjs(taskValues.beginDate).format('MMM D, YYYY')}</Text>}
                                            {taskValues.beginDate && taskValues.endDate && <Text> → </Text>}
                                            {taskValues.endDate && <Text>{dayjs(taskValues.endDate).format('MMM D, YYYY')}</Text>}
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {stepsRequiringAssignment.length > 0 && (
                                <div style={{ marginBottom: 24 }}>
                                    <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                                        STEP ASSIGNMENTS
                                    </Text>
                                    {stepsRequiringAssignment.map((step) => {
                                        const assignment = stepAssignments.get(step.id);
                                        const isUnassigned = !assignment;

                                        const isMultiple = assignment && (assignment.assigneeType === 'ROLE' || assignment.assigneeType === 'DEPARTMENT');

                                        return (
                                            <div
                                                key={step.id}
                                                style={{
                                                    padding: 12,
                                                    marginBottom: 8,
                                                    borderRadius: 8,
                                                    border: isUnassigned ? '1px solid #ff7875' : '1px solid #e5e7eb',
                                                    backgroundColor: isUnassigned ? '#fff2f0' : '#f6ffed',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                }}
                                            >
                                                {isUnassigned ? (
                                                    <WarningOutlined style={{ color: '#ff7875', fontSize: 16 }} />
                                                ) : isMultiple ? (
                                                    <TeamOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                                                ) : (
                                                    <UserOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <Text strong={isUnassigned} style={{ fontSize: 13 }}>
                                                        {step.name}
                                                    </Text>
                                                    {isUnassigned && (
                                                        <div style={{ marginTop: 2 }}>
                                                            <Text type="secondary" style={{ fontSize: 11, color: '#ff7875' }}>
                                                                Assignment required
                                                            </Text>
                                                        </div>
                                                    )}
                                                    {assignment && (
                                                        <div style={{ marginTop: 2 }}>
                                                            <Text strong style={{ fontSize: 11, color: '#52c41a' }}>
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
                                <Button onClick={() => setCurrentStep(2)}>
                                    Back
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={handleCreateTask}
                                    disabled={!isReady}
                                    loading={createTaskMutation.isPending}
                                >
                                    Create
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
                                        filterOption={(input, option) => {
                                            const label = option?.label as string | undefined;
                                            return (label ?? '').toLowerCase().includes(input.toLowerCase());
                                        }}
                                    >
                                        {users.map((user) => {
                                            const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
                                            return (
                                                <Select.Option
                                                    key={user.id}
                                                    value={user.id}
                                                    label={userName}
                                                >
                                                    <Space>
                                                        <Avatar size="small" src={user.avatarUrl}>
                                                            {user.firstName?.charAt(0) || user.email.charAt(0)}
                                                        </Avatar>
                                                        <span>{userName}</span>
                                                    </Space>
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name="priority"
                                    label="Priority"
                                >
                                    <Select placeholder="Select priority">
                                        {PRIORITY_OPTIONS.map((option) => (
                                            <Select.Option key={option.value} value={option.value}>
                                                <Tag color={option.color}>{option.label}</Tag>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Form>
                        )}

                        {selectedStep.assigneeType === 'FIXED' && (
                            <Form form={form} layout="vertical">
                                <div style={{ padding: 16, backgroundColor: '#f9fafb', borderRadius: 8, marginBottom: 16 }}>
                                    <Text type="secondary">
                                        This step has a fixed assignee configured in the workflow template and cannot be changed.
                                    </Text>
                                </div>
                                <Form.Item
                                    name="priority"
                                    label="Priority"
                                >
                                    <Select placeholder="Select priority">
                                        {PRIORITY_OPTIONS.map((option) => (
                                            <Select.Option key={option.value} value={option.value}>
                                                <Tag color={option.color}>{option.label}</Tag>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Form>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default CreateTaskDrawer;
