import React from 'react';
import { Typography } from 'antd';
import {
    PlayCircleOutlined,
    UserOutlined,
    AuditOutlined,
    StopOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { WorkflowStepType } from '../../api/workflow.api';

const { Text } = Typography;

interface NodeTypeConfig {
    type: WorkflowStepType;
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    description: string;
}

const nodeTypes: NodeTypeConfig[] = [
    {
        type: 'START',
        label: 'Start',
        icon: <PlayCircleOutlined />,
        color: '#4f46e5',
        bgColor: '#eef2ff',
        description: 'Entry point',
    },
    {
        type: 'USER_TASK',
        label: 'User Task',
        icon: <UserOutlined />,
        color: '#f59e0b',
        bgColor: '#fef3c7',
        description: 'User action',
    },
    {
        type: 'REVIEW',
        label: 'Review',
        icon: <AuditOutlined />,
        color: '#10b981',
        bgColor: '#d1fae5',
        description: 'Approval step',
    },
    {
        type: 'END',
        label: 'End',
        icon: <StopOutlined />,
        color: '#6b7280',
        bgColor: '#f3f4f6',
        description: 'Completion',
    },
];

interface WorkflowNodePaletteProps {
    onAddNode: (type: WorkflowStepType) => void;
    disableStart?: boolean;
}

const WorkflowNodePalette: React.FC<WorkflowNodePaletteProps> = ({ onAddNode, disableStart }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div>
                <Text strong style={{ fontSize: 13, color: '#374151', letterSpacing: 0.5 }}>
                    WORKFLOW STEPS
                </Text>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                    Click to add to canvas
                </Text>
            </div>

            {/* Node Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {nodeTypes.map((node) => {
                    const isDisabled = node.type === 'START' && disableStart;

                    return (
                        <div
                            key={node.type}
                            onClick={() => !isDisabled && onAddNode(node.type)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 14px',
                                borderRadius: 10,
                                background: isDisabled ? '#f9fafb' : node.bgColor,
                                border: `1.5px solid ${isDisabled ? '#e5e7eb' : node.color}40`,
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                opacity: isDisabled ? 0.5 : 1,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (!isDisabled) {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${node.color}30`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Icon */}
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    background: isDisabled ? '#e5e7eb' : node.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 16,
                                    color: '#fff',
                                    flexShrink: 0,
                                }}
                            >
                                {node.icon}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Text
                                    strong
                                    style={{
                                        fontSize: 13,
                                        color: isDisabled ? '#9ca3af' : '#1f2937',
                                        display: 'block',
                                    }}
                                >
                                    {node.label}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 11,
                                        color: isDisabled ? '#9ca3af' : '#6b7280',
                                    }}
                                >
                                    {node.description}
                                </Text>
                            </div>

                            {/* Add indicator */}
                            {!isDisabled && (
                                <PlusOutlined
                                    style={{
                                        fontSize: 14,
                                        color: node.color,
                                        opacity: 0.6,
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tip */}
            <div
                style={{
                    padding: '10px 12px',
                    background: '#f0f9ff',
                    borderRadius: 8,
                    border: '1px solid #bae6fd',
                }}
            >
                <Text style={{ fontSize: 11, color: '#0369a1' }}>
                    💡 Connect nodes by dragging from the right handle to another node's left handle.
                </Text>
            </div>
        </div>
    );
};

export default WorkflowNodePalette;
