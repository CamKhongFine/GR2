import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
    PlayCircleOutlined,
    UserOutlined,
    CheckCircleOutlined,
    AuditOutlined,
    StopOutlined,
    CheckOutlined,
    CloseOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { Typography, Tooltip } from 'antd';
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
    description?: string;
    assigneeType?: AssigneeType;
    assigneeValue?: string | null;
    assigneeName?: string;
    reviewerName?: string;
    guidanceText?: string;
    onDelete?: (nodeId: string) => void;
    onClick?: (nodeId: string) => void;
    transitions?: NodeTransition[];
    availableNodes?: AvailableNode[];
    onSetRejectTarget?: (sourceNodeId: string, targetNodeId: string) => void;
    onRemoveRejectTarget?: (sourceNodeId: string) => void;
}

// Enterprise color scheme
const nodeColors: Record<WorkflowStepType, { bg: string; border: string; icon: string; headerBg: string }> = {
    START: {
        bg: '#ffffff',
        border: '#597ef7',
        icon: '#597ef7',
        headerBg: '#f0f5ff'
    },
    USER_TASK: {
        bg: '#ffffff',
        border: '#ffa940',
        icon: '#fa8c16',
        headerBg: '#fff7e6'
    },
    REVIEW: {
        bg: '#ffffff',
        border: '#73d13d',
        icon: '#52c41a',
        headerBg: '#f6ffed'
    },
    END: {
        bg: '#ffffff',
        border: '#8c8c8c',
        icon: '#595959',
        headerBg: '#fafafa'
    },
};

const nodeIcons: Record<WorkflowStepType, React.ReactNode> = {
    START: <PlayCircleOutlined />,
    USER_TASK: <UserOutlined />,
    REVIEW: <AuditOutlined />,
    END: <StopOutlined />,
};

const typeLabels: Record<WorkflowStepType, string> = {
    START: 'Start',
    USER_TASK: 'User Task',
    REVIEW: 'Review',
    END: 'End',
};

const WorkflowNode: React.FC<NodeProps<WorkflowNodeData>> = ({ id, data, selected }) => {
    const colors = nodeColors[data.type] || nodeColors.USER_TASK;
    const icon = nodeIcons[data.type] || nodeIcons.USER_TASK;
    const typeLabel = typeLabels[data.type] || data.type;

    const handleClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        if (data.onClick) {
            data.onClick(id);
        }
    };

    // Get transitions for display
    const approveTransition = data.transitions?.find((t) => t.action.toLowerCase() === 'approve');
    const rejectTransition = data.transitions?.find((t) => t.action.toLowerCase() === 'reject');

    // Get assignee display text
    const getAssigneeText = () => {
        if (data.assigneeType === 'FIXED') {
            return data.assigneeName || 'Unknown User';
        }
        return 'Dynamic';
    };

    // Get reviewer display text
    const getReviewerText = () => {
        if (data.reviewerName) {
            return data.reviewerName;
        }
        if (data.assigneeType === 'FIXED') {
            return data.assigneeName || 'Unknown User';
        }
        return 'Dynamic';
    };

    return (
        <Tooltip title="Click to configure" placement="top">
            <div
                onClick={handleClick}
                style={{
                    minWidth: 220,
                    borderRadius: 8,
                    background: colors.bg,
                    border: `2px solid ${selected ? '#1890ff' : colors.border}`,
                    boxShadow: selected
                        ? '0 4px 12px rgba(24, 144, 255, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
                className="workflow-node-enterprise"
            >
                {/* Input handle - not for START */}
                {data.type !== 'START' && (
                    <Handle
                        type="target"
                        position={Position.Left}
                        style={{
                            width: 12,
                            height: 12,
                            background: colors.border,
                            border: '2px solid #fff',
                        }}
                    />
                )}

                {/* Node Header */}
                <div
                    style={{
                        padding: '10px 14px',
                        background: colors.headerBg,
                        borderBottom: `1px solid ${colors.border}20`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    <span style={{ fontSize: 20, color: colors.icon }}>{icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ fontSize: 14, display: 'block', lineHeight: 1.3 }} ellipsis>
                            {data.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {typeLabel}
                        </Text>
                    </div>
                </div>

                {/* Node Body - Role Hints */}
                {(data.type === 'USER_TASK' || data.type === 'REVIEW') && (
                    <div style={{ padding: '10px 14px' }}>
                        {/* Assignee/Reviewer Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: data.type === 'REVIEW' ? 10 : 0 }}>
                            <UserOutlined style={{ color: colors.icon, fontSize: 12 }} />
                            <Text style={{ fontSize: 12, color: '#666' }}>
                                {data.type === 'USER_TASK' ? 'Assigned to: ' : 'Reviewer: '}
                                <Text strong style={{ fontSize: 12 }}>
                                    {data.type === 'USER_TASK' ? getAssigneeText() : getReviewerText()}
                                </Text>
                            </Text>
                        </div>

                        {/* Actions Summary for REVIEW */}
                        {data.type === 'REVIEW' && (
                            <div>
                                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                                    Actions
                                </Text>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                        <CheckOutlined style={{ color: '#52c41a', fontSize: 10 }} />
                                        <span style={{ color: '#52c41a', fontWeight: 500 }}>Approve</span>
                                        <ArrowRightOutlined style={{ color: '#bbb', fontSize: 8 }} />
                                        <span style={{ color: '#666' }}>
                                            {approveTransition?.targetNodeName || 'Next step'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                        <CloseOutlined style={{ color: '#ff4d4f', fontSize: 10 }} />
                                        <span style={{ color: '#ff4d4f', fontWeight: 500 }}>Reject</span>
                                        <ArrowRightOutlined style={{ color: '#bbb', fontSize: 8 }} />
                                        <span style={{ color: '#666' }}>
                                            {rejectTransition?.targetNodeName || 'Previous step'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Minimal body for START/END */}
                {(data.type === 'START' || data.type === 'END') && (
                    <div style={{ padding: '8px 14px' }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {data.type === 'START' ? 'Workflow begins here' : 'Workflow ends here'}
                        </Text>
                    </div>
                )}

                {/* Output handle - not for END */}
                {data.type !== 'END' && (
                    <Handle
                        type="source"
                        position={Position.Right}
                        style={{
                            width: 12,
                            height: 12,
                            background: colors.border,
                            border: '2px solid #fff',
                        }}
                    />
                )}
            </div>
        </Tooltip>
    );
};

export default memo(WorkflowNode);
