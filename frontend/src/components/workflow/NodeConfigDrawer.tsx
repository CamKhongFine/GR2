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
} from 'antd';
import {
    UserOutlined,
    PlayCircleOutlined,
    AuditOutlined,
    StopOutlined,
    TeamOutlined,
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

interface NodeConfigDrawerProps {
    open: boolean;
    nodeId: string | null;
    nodeData: WorkflowNodeData | null;
    users?: UserOption[];
    onSave: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
    onClose: () => void;
    onDelete?: (nodeId: string) => void;
}

const typeIcons: Record<WorkflowStepType, React.ReactNode> = {
    START: <PlayCircleOutlined style={{ color: '#597ef7' }} />,
    USER_TASK: <UserOutlined style={{ color: '#fa8c16' }} />,
    REVIEW: <AuditOutlined style={{ color: '#52c41a' }} />,
    END: <StopOutlined style={{ color: '#595959' }} />,
};

const typeColors: Record<WorkflowStepType, string> = {
    START: 'blue',
    USER_TASK: 'orange',
    REVIEW: 'green',
    END: 'default',
};

const NodeConfigDrawer: React.FC<NodeConfigDrawerProps> = ({
    open,
    nodeId,
    nodeData,
    users = [],
    onSave,
    onClose,
    onDelete,
}) => {
    const [form] = Form.useForm();
    const [assigneeType, setAssigneeType] = React.useState<AssigneeType>('DYNAMIC');

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

    const isReadOnly = nodeData?.type === 'START' || nodeData?.type === 'END';

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
            width={420}
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
                            <Form.Item
                                name="assigneeType"
                                label={nodeData.type === 'USER_TASK' ? 'Assignee' : 'Reviewer'}
                            >
                                <Radio.Group
                                    onChange={(e) => {
                                        setAssigneeType(e.target.value);
                                        if (e.target.value === 'DYNAMIC') {
                                            form.setFieldValue('assigneeValue', undefined);
                                        }
                                    }}
                                >
                                    <Space direction="vertical">
                                        <Radio value="DYNAMIC">
                                            <Space>
                                                <UserOutlined />
                                                <span>Dynamic</span>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    — Selected at runtime by the user
                                                </Text>
                                            </Space>
                                        </Radio>
                                        <Radio value="FIXED">
                                            <Space>
                                                <UserOutlined style={{ color: '#1890ff' }} />
                                                <span>Fixed</span>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    — Predefined assignee
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

                    {/* Guidance Text - REVIEW only */}
                    {nodeData.type === 'REVIEW' && (
                        <Form.Item name="guidanceText" label="Review Guidance">
                            <TextArea
                                rows={3}
                                placeholder="Instructions or criteria for the reviewer"
                            />
                        </Form.Item>
                    )}

                    {/* Read-only info for START/END */}
                    {isReadOnly && (
                        <div style={{
                            background: '#fafafa',
                            padding: 16,
                            borderRadius: 8,
                            marginTop: 16
                        }}>
                            <Text type="secondary">
                                {nodeData.type === 'START'
                                    ? 'This is the entry point of the workflow. Tasks will start from this step.'
                                    : 'This is the completion point. When a task reaches this step, the workflow is complete.'
                                }
                            </Text>
                        </div>
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
