import React from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
} from 'reactflow';
import { DeleteOutlined } from '@ant-design/icons';

interface CustomEdgeData {
    onDelete?: (edgeId: string) => void;
}

const WorkflowEdge: React.FC<EdgeProps<CustomEdgeData>> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    labelStyle,
    data,
}) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        if (data?.onDelete) {
            data.onDelete(id);
        }
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#fff',
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: '1px solid #e8e8e8',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                    className="nodrag nopan"
                >
                    <span style={{ ...labelStyle }}>{label}</span>
                    <DeleteOutlined
                        onClick={onEdgeClick}
                        style={{
                            color: '#ff4d4f',
                            fontSize: 14,
                            cursor: 'pointer',
                            opacity: 0.7,
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                    />
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default WorkflowEdge;
