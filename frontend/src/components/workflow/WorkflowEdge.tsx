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
    const [isHovered, setIsHovered] = React.useState(false);

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
                        transform: `translate(-50%, -100%) translate(${labelX}px,${labelY - 8}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                    className="nodrag nopan"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <span style={{ ...labelStyle }}>{label}</span>
                    {isHovered && (
                        <DeleteOutlined
                            onClick={onEdgeClick}
                            style={{
                                color: '#ff4d4f',
                                fontSize: 14,
                                cursor: 'pointer',
                            }}
                        />
                    )}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default WorkflowEdge;
