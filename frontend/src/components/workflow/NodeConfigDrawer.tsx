import React, { useEffect } from 'react';
import {
    Drawer,
    Form,
    Input,
    Select,
    Radio,
    Space,
    Button,
    Typography,
    Divider,
    Tag,
    Alert,
} from 'antd';
import {
    UserOutlined,
    PlayCircleOutlined,
    AuditOutlined,
    StopOutlined,
    CheckOutlined,
    CloseOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { WorkflowNodeData } from './WorkflowNode';
import { WorkflowStepType, AssigneeType } from '../../api/workflow.api';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface UserOption {
    id: string;
    name: string;
    email?: string;
}

interface AvailableNode {
    id: string;
    name: string;
    type: string;
}

interface NodeConfigDrawerProps {
    open: boolean;
    nodeId: string | null;
    nodeData: WorkflowNodeData | null;
    users?: UserOption[];
    availableNodes?: AvailableNode[];
    currentRejectTarget?: string | null;
    onSave: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
    onClose: () => void;
    onDelete?: (nodeId: string) => void;
    onSetRejectTarget?: (sourceNodeId: string, targetNodeId: string) => void;
    onRemoveRejectTarget?: (sourceNodeId: string) => void;
}

const typeIcons: Record<WorkflowStepType, React.ReactNode> = {
    START: <PlayCircleOutlined style={{ color: '#4f46e5' }} />,
    USER_TASK: <UserOutlined style={{ color: '#f59e0b' }} />,
    REVIEW: <AuditOutlined style={{ color: '#10b981' }} />,
    END: <StopOutlined style={{ color: '#6b7280' }} />,
};

const typeColors: Record<WorkflowStepType, string> = {
    START: 'purple',
    USER_TASK: 'orange',
    REVIEW: 'green',
    END: 'default',
};

const NodeConfigDrawer: React.FC<NodeConfigDrawerProps> = ({
    open,
    nodeId,
    nodeData,
    users = [],
    availableNodes = [],
    currentRejectTarget,
    onSave,
    onClose,
    onDelete,
    onSetRejectTarget,
    onRemoveRejectTarget,
}) => {
    const [form] = Form.useForm();
    const [assigneeType, setAssigneeType] = React.useState<AssigneeType>('DYNAMIC');
    const [rejectTargetId, setRejectTargetId] = React.useState<string | undefined>(undefined);

    // Reset form when node changes
    useEffect(() => {
        if (nodeData) {
            form.setFieldsValue({
                name: nodeData.name,
                description: nodeData.description || '',
                assigneeType: nodeData.assigneeType || 'DYNAMIC',
                assigneeValue: nodeData.assigneeValue || undefined,
                guidanceText: nodeData.guidanceText || '',
            });
            setAssigneeType(nodeData.assigneeType || 'DYNAMIC');
        }
    }, [nodeData, form]);

    // Update reject target when currentRejectTarget changes
    useEffect(() => {
        setRejectTargetId(currentRejectTarget || undefined);
    }, [currentRejectTarget]);

    const handleSave = async () => {
        if (!nodeId) return;
        try {
            const values = await form.validateFields();

            const updates: Partial<WorkflowNodeData> = {
                name: values.name,
                description: values.description,
            };

            // Add assignee fields for USER_TASK and REVIEW
            if (nodeData?.type === 'USER_TASK' || nodeData?.type === 'REVIEW') {
                updates.assigneeType = values.assigneeType;
                updates.assigneeValue = values.assigneeType === 'FIXED' ? values.assigneeValue : null;

                // Find user name for display
                if (values.assigneeType === 'FIXED' && values.assigneeValue) {
                    const selectedUser = users.find(u => u.id === values.assigneeValue);
                    updates.assigneeName = selectedUser?.name || undefined;
                } else {
                    updates.assigneeName = undefined;
                }
            }

            // Add guidance text for REVIEW
            if (nodeData?.type === 'REVIEW') {
                updates.guidanceText = values.guidanceText;
            }

            onSave(nodeId, updates);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleDelete = () => {
        if (nodeId && onDelete) {
            onDelete(nodeId);
            onClose();
        }
    };

    const handleRejectTargetChange = (value: string | undefined) => {
        setRejectTargetId(value);
        if (nodeId && value && onSetRejectTarget) {
            onSetRejectTarget(nodeId, value);
        } else if (nodeId && !value && onRemoveRejectTarget) {
            onRemoveRejectTarget(nodeId);
        }
    };

    const isReadOnly = nodeData?.type === 'START' || nodeData?.type === 'END';

    // Get reject target name
    const rejectTargetName = rejectTargetId
        ? availableNodes.find(n => n.id === rejectTargetId)?.name
        : null;

    return (
        <Drawer
            title={
                <Space>
                    {nodeData && typeIcons[nodeData.type]}
                    <span>Configure Step</span>
                    {nodeData && (
                        <Tag color={typeColors[nodeData.type]}>
                            {nodeData.type.replace('_', ' ')}
                        </Tag>
                    )}
                </Space>
            }
            width={440}
            open={open}
            onClose={onClose}
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" onClick={handleSave}>
                        Apply
                    </Button>
                </div>
            }
        >
            {nodeData && (
                <Form form={form} layout="vertical">
                    {/* Step Name */}
                    <Form.Item
                        name="name"
                        label="Step Name"
                        rules={[{ required: true, message: 'Step name is required' }]}
                    >
                        <Input placeholder="Enter step name" />
                    </Form.Item>

                    {/* Description */}
                    <Form.Item name="description" label="Description">
                        <TextArea
                            rows={2}
                            placeholder="Optional description for this step"
                        />
                    </Form.Item>

                    {/* Assignee Configuration - USER_TASK and REVIEW */}
                    {(nodeData.type === 'USER_TASK' || nodeData.type === 'REVIEW') && (
                        <>
                            <Divider style={{ margin: '16px 0 12px' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {nodeData.type === 'USER_TASK' ? 'ASSIGNEE' : 'REVIEWER'}
                                </Text>
                            </Divider>

                            <Form.Item
                                name="assigneeType"
                                label="Assignment Type"
                            >
                                <Radio.Group
                                    onChange={(e) => {
                                        setAssigneeType(e.target.value);
                                        if (e.target.value === 'DYNAMIC') {
                                            form.setFieldValue('assigneeValue', undefined);
                                        }
                                    }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Radio value="DYNAMIC">
                                            <Space>
                                                <UserOutlined />
                                                <span>Dynamic</span>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    — Selected at runtime
                                                </Text>
                                            </Space>
                                        </Radio>
                                        <Radio value="FIXED">
                                            <Space>
                                                <UserOutlined style={{ color: '#3b82f6' }} />
                                                <span>Fixed</span>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    — Predefined user
                                                </Text>
                                            </Space>
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>

                            {assigneeType === 'FIXED' && (
                                <Form.Item
                                    name="assigneeValue"
                                    label={nodeData.type === 'USER_TASK' ? 'Select Assignee' : 'Select Reviewer'}
                                    rules={[{ required: true, message: 'Please select a user' }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Search and select user"
                                        optionFilterProp="label"
                                        options={users.map((user) => ({
                                            value: user.id,
                                            label: `${user.name}${user.email ? ` (${user.email})` : ''}`,
                                        }))}
                                    />
                                </Form.Item>
                            )}
                        </>
                    )}

                    {/* Reject Target - REVIEW only */}
                    {nodeData.type === 'REVIEW' && onSetRejectTarget && (
                        <>
                            <Divider style={{ margin: '16px 0 12px' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    ACTIONS
                                </Text>
                            </Divider>

                            {/* Approve Action Display */}
                            <div style={{
                                padding: '10px 14px',
                                background: '#f0fdf4',
                                borderRadius: 8,
                                border: '1px solid #bbf7d0',
                                marginBottom: 12,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 6,
                                        background: '#10b981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <CheckOutlined style={{ color: '#fff', fontSize: 12 }} />
                                    </div>
                                    <Text strong style={{ color: '#10b981' }}>Approve</Text>
                                    <ArrowRightOutlined style={{ color: '#bbf7d0', marginLeft: 'auto' }} />
                                    <Text style={{ color: '#065f46' }}>Next step (via edge)</Text>
                                </div>
                            </div>

                            {/* Reject Target Selection */}
                            <div style={{
                                padding: '8px 12px',
                                background: '#fef2f2',
                                borderRadius: 8,
                                border: '1px solid #fecaca',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <div style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 5,
                                        background: '#ef4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <CloseOutlined style={{ color: '#fff', fontSize: 10 }} />
                                    </div>
                                    <Text strong style={{ color: '#ef4444', fontSize: 12 }}>Reject</Text>
                                    <ArrowRightOutlined style={{ color: '#fecaca', marginLeft: 'auto', fontSize: 10 }} />
                                </div>
                                <Select
                                    placeholder="Select step to return to"
                                    style={{ width: '100%' }}
                                    size="small"
                                    value={rejectTargetId}
                                    onChange={handleRejectTargetChange}
                                    allowClear
                                >
                                    {availableNodes
                                        .filter(n => n.id !== nodeId && n.type !== 'END')
                                        .map((node) => (
                                            <Select.Option key={node.id} value={node.id}>
                                                {node.name} ({node.type.replace('_', ' ')})
                                            </Select.Option>
                                        ))}
                                </Select>
                                {!rejectTargetId && (
                                    <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 4 }}>
                                        Select which step to return to when rejected
                                    </Text>
                                )}
                            </div>
                        </>
                    )}

                    {/* Guidance Text - REVIEW only */}
                    {nodeData.type === 'REVIEW' && (
                        <Form.Item name="guidanceText" label="Review Guidance" style={{ marginTop: 16 }}>
                            <TextArea
                                rows={3}
                                placeholder="Instructions or criteria for the reviewer"
                            />
                        </Form.Item>
                    )}

                    {/* Read-only info for START/END */}
                    {isReadOnly && (
                        <Alert
                            type="info"
                            showIcon
                            message={
                                nodeData.type === 'START'
                                    ? 'This is the entry point of the workflow. Tasks will start from this step.'
                                    : 'This is the completion point. When a task reaches this step, the workflow is complete.'
                            }
                            style={{ marginTop: 16 }}
                        />
                    )}

                    {/* Delete Button */}
                    {onDelete && !isReadOnly && (
                        <>
                            <Divider style={{ margin: '24px 0 16px' }} />
                            <Button
                                danger
                                block
                                onClick={handleDelete}
                            >
                                Delete This Step
                            </Button>
                        </>
                    )}
                </Form>
            )}
        </Drawer>
    );
};

export default NodeConfigDrawer;
