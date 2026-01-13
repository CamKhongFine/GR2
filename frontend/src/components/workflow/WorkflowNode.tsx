import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
    PlayCircleOutlined,
    UserOutlined,
    CheckCircleOutlined,
    FileDoneOutlined,
    CloseCircleFilled,
    CheckOutlined,
    CloseOutlined,
    ArrowRightOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { Typography, Divider, Select, Space } from 'antd';
import { WorkflowStepType, AssigneeType } from '../../api/workflow.api';

const { Text } = Typography;

export interface NodeTransition {
    action: string;
    targetNodeId: string;
    targetNodeName: string;
}

export interface AvailableNode {
    id: string;
    name: string;
}

export interface WorkflowNodeData {
    name: string;
    type: WorkflowStepType;
    assigneeType?: AssigneeType;
    assigneeValue?: string | null;
    assigneeName?: string; // Display name for the assigned user
    onDelete?: (nodeId: string) => void;
    transitions?: NodeTransition[];
    availableNodes?: AvailableNode[];
    onSetRejectTarget?: (sourceNodeId: string, targetNodeId: string) => void;
    onRemoveRejectTarget?: (sourceNodeId: string) => void;
}

const nodeColors: Record<WorkflowStepType, { bg: string; border: string; icon: string }> = {
    START: { bg: '#e6f7ff', border: '#1890ff', icon: '#1890ff' },
    USER_TASK: { bg: '#fff7e6', border: '#fa8c16', icon: '#fa8c16' },
    REVIEW: { bg: '#f6ffed', border: '#52c41a', icon: '#52c41a' },
    END: { bg: '#fff1f0', border: '#ff4d4f', icon: '#ff4d4f' },
};

const nodeIcons: Record<WorkflowStepType, React.ReactNode> = {
    START: <PlayCircleOutlined />,
    USER_TASK: <UserOutlined />,
    REVIEW: <FileDoneOutlined />,
    END: <CheckCircleOutlined />,
};

const WorkflowNode: React.FC<NodeProps<WorkflowNodeData>> = ({ id, data, selected }) => {
    const colors = nodeColors[data.type] || nodeColors.USER_TASK;
    const icon = nodeIcons[data.type] || nodeIcons.USER_TASK;

    const handleDelete = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        if (data.onDelete) {
            data.onDelete(id);
        }
    };

    // Get approve and reject transitions for REVIEW nodes
    const approveTransition = data.transitions?.find((t) => t.action === 'approve');
    const rejectTransition = data.transitions?.find((t) => t.action === 'reject');

    // Handle reject target selection
    const handleRejectTargetChange = (targetNodeId: string) => {
        if (data.onSetRejectTarget) {
            data.onSetRejectTarget(id, targetNodeId);
        }
    };

    const handleRemoveReject = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        if (data.onRemoveRejectTarget) {
            data.onRemoveRejectTarget(id);
        }
    };

    // Filter available nodes for reject target (exclude self, END nodes)
    const rejectTargetOptions = (data.availableNodes || [])
        .filter((n) => n.id !== id)
        .map((n) => ({ value: n.id, label: n.name }));

    return (
        <div
            style={{
                padding: '12px 16px',
                borderRadius: 8,
                background: colors.bg,
                border: `2px solid ${selected ? '#1890ff' : colors.border}`,
                boxShadow: selected ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
                minWidth: data.type === 'REVIEW' ? 200 : 150,
                textAlign: 'center',
                position: 'relative',
            }}
        >
            {/* Delete button - top right corner */}
            {data.onDelete && (
                <CloseCircleFilled
                    onClick={handleDelete}
                    className="nodrag"
                    style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        color: '#ff4d4f',
                        fontSize: 18,
                        cursor: 'pointer',
                        background: '#fff',
                        borderRadius: '50%',
                        opacity: 0.8,
                        transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
                />
            )}

            {/* Input handle - not for START */}
            {data.type !== 'START' && (
                <Handle
                    type="target"
                    position={Position.Left}
                    style={{
                        width: 10,
                        height: 10,
                        background: colors.border,
                    }}
                />
            )}

            {/* Node header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span style={{ fontSize: 18, color: colors.icon }}>{icon}</span>
                <Text strong>{data.name}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                {data.type.replace('_', ' ')}
            </Text>

            {/* Action Panel for REVIEW nodes */}
            {data.type === 'REVIEW' && (
                <div style={{ marginTop: 8 }}>
                    <Divider style={{ margin: '8px 0', borderColor: '#d9d9d9' }} />
                    <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 6 }}>
                        Actions
                    </Text>
                    <div style={{ textAlign: 'left', fontSize: 11 }}>
                        {/* Approve action (read-only display) */}
                        {approveTransition && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                                <CheckOutlined style={{ color: '#52c41a', fontSize: 10 }} />
                                <span style={{ color: '#52c41a' }}>Approve</span>
                                <ArrowRightOutlined style={{ color: '#999', fontSize: 8 }} />
                                <span style={{ color: '#666' }}>{approveTransition.targetNodeName}</span>
                            </div>
                        )}

                        {/* Reject action with dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CloseOutlined style={{ color: '#ff4d4f', fontSize: 10 }} />
                            <span style={{ color: '#ff4d4f', minWidth: 40 }}>Reject</span>
                            <ArrowRightOutlined style={{ color: '#999', fontSize: 8 }} />
                            {rejectTransition ? (
                                <Space size={2}>
                                    <span style={{ color: '#666' }}>{rejectTransition.targetNodeName}</span>
                                    <DeleteOutlined
                                        onClick={handleRemoveReject}
                                        className="nodrag"
                                        style={{ color: '#999', fontSize: 10, cursor: 'pointer' }}
                                    />
                                </Space>
                            ) : (
                                <Select
                                    size="small"
                                    placeholder="Select..."
                                    style={{ width: 90, fontSize: 10 }}
                                    options={rejectTargetOptions}
                                    onChange={handleRejectTargetChange}
                                    className="nodrag"
                                    popupClassName="nodrag"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Single output handle - not for END */}
            {data.type !== 'END' && (
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{
                        width: 10,
                        height: 10,
                        background: colors.border,
                    }}
                />
            )}
        </div>
    );
};

export default memo(WorkflowNode);




