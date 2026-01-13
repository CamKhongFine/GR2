import React from 'react';
import { Button, Tooltip } from 'antd';
import {
    PlayCircleOutlined,
    UserOutlined,
    CheckCircleOutlined,
    FileDoneOutlined,
} from '@ant-design/icons';
import { WorkflowStepType } from '../../api/workflow.api';

interface NodeTypeConfig {
    type: WorkflowStepType;
    label: string;
    icon: React.ReactNode;
    color: string;
    description: string;
}

const nodeTypes: NodeTypeConfig[] = [
    {
        type: 'START',
        label: 'Start',
        icon: <PlayCircleOutlined />,
        color: '#1890ff',
        description: 'The starting point of the workflow',
    },
    {
        type: 'USER_TASK',
        label: 'User Task',
        icon: <UserOutlined />,
        color: '#fa8c16',
        description: 'A task that requires user action',
    },
    {
        type: 'REVIEW',
        label: 'Review',
        icon: <FileDoneOutlined />,
        color: '#52c41a',
        description: 'A review/approval step',
    },
    {
        type: 'END',
        label: 'End',
        icon: <CheckCircleOutlined />,
        color: '#ff4d4f',
        description: 'The end point of the workflow',
    },
];

interface WorkflowNodePaletteProps {
    onAddNode: (type: WorkflowStepType) => void;
    disableStart?: boolean;
}

const WorkflowNodePalette: React.FC<WorkflowNodePaletteProps> = ({ onAddNode, disableStart }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 16,
                background: '#fafafa',
                borderRadius: 8,
                border: '1px solid #d9d9d9',
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Add Node</div>
            {nodeTypes.map((node) => (
                <Tooltip key={node.type} title={node.description} placement="right">
                    <Button
                        icon={node.icon}
                        onClick={() => onAddNode(node.type)}
                        disabled={node.type === 'START' && disableStart}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: 8,
                            borderColor: node.color,
                            color: node.type === 'START' && disableStart ? undefined : node.color,
                        }}
                    >
                        {node.label}
                    </Button>
                </Tooltip>
            ))}
        </div>
    );
};

export default WorkflowNodePalette;
