import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
    PlayCircleOutlined,
    UserOutlined,
    AuditOutlined,
    StopOutlined,
    CheckOutlined,
    CloseOutlined,
    ArrowRightOutlined,
    SendOutlined,
} from '@ant-design/icons';
import { Typography } from 'antd';
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

// Enterprise color scheme - Modern, clean, professional
const nodeColors: Record<WorkflowStepType, {
    bg: string;
    border: string;
    icon: string;
    headerBg: string;
    headerText: string;
    accent: string;
}> = {
    START: {
        bg: '#ffffff',
        border: '#4f46e5',
        icon: '#ffffff',
        headerBg: '#4f46e5',
        headerText: '#ffffff',
        accent: '#818cf8',
    },
    USER_TASK: {
        bg: '#ffffff',
        border: '#f59e0b',
        icon: '#ffffff',
        headerBg: '#f59e0b',
        headerText: '#ffffff',
        accent: '#fbbf24',
    },
    REVIEW: {
        bg: '#ffffff',
        border: '#10b981',
        icon: '#ffffff',
        headerBg: '#10b981',
        headerText: '#ffffff',
        accent: '#34d399',
    },
    END: {
        bg: '#ffffff',
        border: '#6b7280',
        icon: '#ffffff',
        headerBg: '#6b7280',
        headerText: '#ffffff',
        accent: '#9ca3af',
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
    const submitTransition = data.transitions?.find((t) => t.action.toLowerCase() === 'submit');

    // Get assignee display text
    const getAssigneeText = () => {
        if (data.assigneeType === 'FIXED') {
            return data.assigneeName || 'Not assigned';
        }
        return 'Dynamic Assignment';
    };

    // Get reviewer display text
    const getReviewerText = () => {
        if (data.reviewerName) {
            return data.reviewerName;
        }
        if (data.assigneeType === 'FIXED') {
            return data.assigneeName || 'Not assigned';
        }
        return 'Dynamic Assignment';
    };

    return (
        <div
            onClick={handleClick}
            style={{
                minWidth: 240,
                borderRadius: 12,
                background: colors.bg,
                border: `2px solid ${selected ? '#3b82f6' : colors.border}`,
                boxShadow: selected
                    ? '0 8px 24px rgba(59, 130, 246, 0.25)'
                    : '0 4px 16px rgba(0, 0, 0, 0.08)',
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
                        width: 14,
                        height: 14,
                        background: colors.border,
                        border: '3px solid #fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                />
            )}

            {/* Node Header */}
            <div
                style={{
                    padding: '12px 16px',
                    background: colors.headerBg,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        color: colors.icon,
                    }}
                >
                    {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                        strong
                        style={{
                            fontSize: 14,
                            display: 'block',
                            lineHeight: 1.3,
                            color: colors.headerText,
                        }}
                        ellipsis
                    >
                        {data.name}
                    </Text>
                    <Text
                        style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: 600,
                        }}
                    >
                        {typeLabel}
                    </Text>
                </div>
            </div>

            {/* Node Body - USER_TASK */}
            {data.type === 'USER_TASK' && (
                <div style={{ padding: '14px 16px' }}>
                    {/* Assignee Info */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        background: '#fef3c7',
                        borderRadius: 8,
                        marginBottom: 12,
                    }}>
                        <UserOutlined style={{ color: '#f59e0b', fontSize: 14 }} />
                        <div>
                            <Text style={{ fontSize: 10, color: '#92400e', display: 'block', fontWeight: 600 }}>
                                ASSIGNED TO
                            </Text>
                            <Text strong style={{ fontSize: 12, color: '#78350f' }}>
                                {getAssigneeText()}
                            </Text>
                        </div>
                    </div>

                    {/* Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        <div style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <SendOutlined style={{ color: '#3b82f6', fontSize: 11 }} />
                        </div>
                        <span style={{ color: '#6b7280' }}>Submit</span>
                        <ArrowRightOutlined style={{ color: '#d1d5db', fontSize: 10 }} />
                        <span style={{ color: '#374151', fontWeight: 500 }}>
                            {submitTransition?.targetNodeName || 'Next step'}
                        </span>
                    </div>
                </div>
            )}

            {/* Node Body - REVIEW */}
            {data.type === 'REVIEW' && (
                <div style={{ padding: '14px 16px' }}>
                    {/* Reviewer Info */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        background: '#d1fae5',
                        borderRadius: 8,
                        marginBottom: 12,
                    }}>
                        <AuditOutlined style={{ color: '#10b981', fontSize: 14 }} />
                        <div>
                            <Text style={{ fontSize: 10, color: '#065f46', display: 'block', fontWeight: 600 }}>
                                REVIEWER
                            </Text>
                            <Text strong style={{ fontSize: 12, color: '#064e3b' }}>
                                {getReviewerText()}
                            </Text>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* Approve Action */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            padding: '6px 10px',
                            background: '#f0fdf4',
                            borderRadius: 6,
                            border: '1px solid #bbf7d0',
                        }}>
                            <div style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                background: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <CheckOutlined style={{ color: '#fff', fontSize: 10 }} />
                            </div>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Approve</span>
                            <ArrowRightOutlined style={{ color: '#bbf7d0', fontSize: 10 }} />
                            <span style={{ color: '#065f46', fontWeight: 500, flex: 1 }}>
                                {approveTransition?.targetNodeName || 'Next step'}
                            </span>
                        </div>

                        {/* Reject Action */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            padding: '6px 10px',
                            background: '#fef2f2',
                            borderRadius: 6,
                            border: '1px solid #fecaca',
                        }}>
                            <div style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                background: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <CloseOutlined style={{ color: '#fff', fontSize: 10 }} />
                            </div>
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>Reject</span>
                            <ArrowRightOutlined style={{ color: '#fecaca', fontSize: 10 }} />
                            <span style={{ color: '#991b1b', fontWeight: 500, flex: 1 }}>
                                {rejectTransition?.targetNodeName || 'Return to...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Minimal body for START/END */}
            {(data.type === 'START' || data.type === 'END') && (
                <div style={{ padding: '12px 16px' }}>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
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
                        width: 14,
                        height: 14,
                        background: colors.border,
                        border: '3px solid #fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                />
            )}
        </div>
    );
};

export default memo(WorkflowNode);
