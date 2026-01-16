import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    BackgroundVariant,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Modal, Input, Form, message, Select } from 'antd';
import WorkflowNode, { WorkflowNodeData } from './WorkflowNode';
import WorkflowNodePalette from './WorkflowNodePalette';
import {
    WorkflowStepType,
    WorkflowStepResponse,
    WorkflowTransitionResponse,
    WorkflowStepRequest,
    WorkflowTransitionRequest,
} from '../../api/workflow.api';

interface WorkflowCanvasProps {
    initialSteps?: WorkflowStepResponse[];
    initialTransitions?: WorkflowTransitionResponse[];
    readOnly?: boolean;
    onSave?: (steps: WorkflowStepRequest[], transitions: WorkflowTransitionRequest[]) => void;
    onNodeClick?: (nodeId: string) => void;
}

// Counter for generating unique node IDs
let nodeIdCounter = 0;
const generateNodeId = () => `node_${Date.now()}_${nodeIdCounter++}`;

const nodeTypes = {
    workflowNode: WorkflowNode,
};

// Convert API steps to ReactFlow nodes
const stepsToNodes = (steps: WorkflowStepResponse[], onNodeClick?: (nodeId: string) => void): Node<WorkflowNodeData>[] => {
    return steps.map((step, index) => ({
        id: step.id.toString(),
        type: 'workflowNode',
        data: {
            name: step.name,
            type: step.type,
            description: step.description,
            assigneeType: step.assigneeType,
            assigneeValue: step.assigneeValue,
            assigneeName: step.assigneeName || undefined,
            onClick: onNodeClick,
        },
        position: {
            x: (step.stepOrder ?? index) * 250 + 50,
            y: 150,
        },
    }));
};

// Convert API transitions to ReactFlow edges
const transitionsToEdges = (transitions: WorkflowTransitionResponse[]): Edge[] => {
    return transitions.map((transition) => {
        const isReject = transition.action?.toLowerCase() === 'reject';
        const isApprove = transition.action?.toLowerCase() === 'approve';

        return {
            id: `edge_${transition.fromStepId}_${transition.toStepId}_${transition.action || 'next'}`,
            source: transition.fromStepId.toString(),
            target: transition.toStepId.toString(),
            label: transition.action,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isReject ? '#ff4d4f' : isApprove ? '#52c41a' : '#888',
            },
            style: {
                stroke: isReject ? '#ff4d4f' : isApprove ? '#52c41a' : '#888',
                strokeWidth: 2,
                strokeDasharray: isReject ? '5,5' : undefined,
            },
            labelStyle: {
                fill: isReject ? '#ff4d4f' : isApprove ? '#52c41a' : '#666',
                fontSize: 12,
                fontWeight: 600,
            },
            labelBgStyle: {
                fill: '#fff',
            },
        };
    });
};

// Convert ReactFlow state to API request format
export const nodesToSteps = (nodes: Node<WorkflowNodeData>[]): WorkflowStepRequest[] => {
    return nodes.map((node, index) => ({
        clientId: node.id,
        name: node.data.name,
        description: '',
        type: node.data.type,
        stepOrder: index,
    }));
};

export const edgesToTransitions = (edges: Edge[]): WorkflowTransitionRequest[] => {
    return edges.map((edge) => ({
        from: edge.source,
        to: edge.target,
        action: (edge.label as string) || 'next',
    }));
};

// Validation
export const validateWorkflow = (nodes: Node<WorkflowNodeData>[], edges: Edge[]): string | null => {
    const startNodes = nodes.filter((n) => n.data.type === 'START');
    if (startNodes.length === 0) {
        return 'Workflow must have exactly one START step';
    }
    if (startNodes.length > 1) {
        return 'Workflow can only have one START step';
    }

    const endNodes = nodes.filter((n) => n.data.type === 'END');
    if (endNodes.length === 0) {
        return 'Workflow must have at least one END step';
    }

    // Check if all nodes are connected (optional but recommended)
    const connectedNodes = new Set<string>();
    edges.forEach((edge) => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
    });

    if (nodes.length > 1 && connectedNodes.size < nodes.length) {
        return 'All steps must be connected with transitions';
    }

    return null;
};

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
    initialSteps = [],
    initialTransitions = [],
    readOnly = false,
    onNodeClick,
}) => {
    const initialNodes = useMemo(() => stepsToNodes(initialSteps, onNodeClick), [initialSteps, onNodeClick]);
    const initialEdges = useMemo(() => transitionsToEdges(initialTransitions), [initialTransitions]);

    const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes when onNodeClick changes
    React.useEffect(() => {
        if (onNodeClick) {
            setNodes((nds) =>
                nds.map((node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        onClick: onNodeClick,
                    },
                }))
            );
        }
    }, [onNodeClick, setNodes]);

    // Modal state for adding nodes
    const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
    const [pendingNodeType, setPendingNodeType] = useState<WorkflowStepType | null>(null);
    const [nodeNameForm] = Form.useForm();

    // Modal state for REVIEW reject target selection
    const [isRejectTargetModalOpen, setIsRejectTargetModalOpen] = useState(false);
    const [pendingReviewConnection, setPendingReviewConnection] = useState<{
        sourceId: string;
        connection: Connection;
    } | null>(null);
    const [rejectTargetForm] = Form.useForm();

    // Check if START node already exists
    const hasStartNode = nodes.some((n) => n.data.type === 'START');

    // Get source node type
    const getSourceNodeType = (sourceId: string): WorkflowStepType | null => {
        const sourceNode = nodes.find((n) => n.id === sourceId);
        return sourceNode?.data.type || null;
    };

    // Create edge with proper styling
    const createEdge = (source: string, target: string, action: string): Edge => {
        const isReject = action.toLowerCase() === 'reject';
        const isApprove = action.toLowerCase() === 'approve';

        return {
            id: `edge_${source}_${target}_${action}`,
            source,
            target,
            label: action,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isReject ? '#ff4d4f' : isApprove ? '#52c41a' : '#888',
            },
            style: {
                stroke: isReject ? '#ff4d4f' : isApprove ? '#52c41a' : '#888',
                strokeWidth: 2,
                strokeDasharray: isReject ? '5,5' : undefined,
            },
            labelStyle: {
                fill: isReject ? '#ff4d4f' : isApprove ? '#52c41a' : '#666',
                fontSize: 12,
                fontWeight: 600,
            },
            labelBgStyle: {
                fill: '#fff',
            },
        };
    };

    const onConnect = useCallback(
        (connection: Connection) => {
            if (readOnly || !connection.source || !connection.target) return;

            const sourceType = getSourceNodeType(connection.source);

            if (sourceType === 'START') {
                // START always uses "start" action
                const newEdge = createEdge(connection.source, connection.target, 'start');
                setEdges((eds) => addEdge(newEdge, eds));
            } else if (sourceType === 'USER_TASK') {
                // USER_TASK always uses "submit" action
                const newEdge = createEdge(connection.source, connection.target, 'submit');
                setEdges((eds) => addEdge(newEdge, eds));
            } else if (sourceType === 'REVIEW') {
                // Check if approve edge already exists
                const existingApprove = edges.find(
                    (e) => e.source === connection.source && e.label?.toString().toLowerCase() === 'approve'
                );

                if (!existingApprove) {
                    // First connection from REVIEW is "approve"
                    const newEdge = createEdge(connection.source, connection.target, 'approve');
                    setEdges((eds) => addEdge(newEdge, eds));
                } else {
                    // Second connection is "reject" - show modal to select target
                    setPendingReviewConnection({ sourceId: connection.source, connection });
                    rejectTargetForm.setFieldsValue({ targetNodeId: connection.target });
                    setIsRejectTargetModalOpen(true);
                }
            } else {
                // Default action for other types
                const newEdge = createEdge(connection.source, connection.target, 'next');
                setEdges((eds) => addEdge(newEdge, eds));
            }
        },
        [readOnly, nodes, edges, setEdges, rejectTargetForm]
    );

    // Handle reject target selection
    const handleRejectTargetSubmit = async () => {
        if (!pendingReviewConnection) return;
        try {
            const values = await rejectTargetForm.validateFields();
            const newEdge = createEdge(
                pendingReviewConnection.sourceId,
                values.targetNodeId,
                'reject'
            );
            setEdges((eds) => addEdge(newEdge, eds));
            setIsRejectTargetModalOpen(false);
            setPendingReviewConnection(null);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Get available nodes for reject target (previous steps, not END)
    const getRejectTargetOptions = () => {
        return nodes.filter((n) => n.data.type !== 'START' && n.data.type !== 'END');
    };

    const handleAddNode = (type: WorkflowStepType) => {
        if (readOnly) return;
        if (type === 'START' && hasStartNode) {
            message.warning('Workflow can only have one START step');
            return;
        }
        setPendingNodeType(type);
        nodeNameForm.resetFields();
        setIsAddNodeModalOpen(true);
    };

    const handleNodeNameSubmit = async () => {
        if (!pendingNodeType) return;
        try {
            const values = await nodeNameForm.validateFields();
            const newNode: Node<WorkflowNodeData> = {
                id: generateNodeId(),
                type: 'workflowNode',
                data: {
                    name: values.name,
                    type: pendingNodeType,
                },
                position: {
                    x: Math.random() * 400 + 100,
                    y: Math.random() * 200 + 100,
                },
            };
            setNodes((nds) => [...nds, newNode]);
            setIsAddNodeModalOpen(false);
            setPendingNodeType(null);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleDeleteNode = useCallback(
        (nodeId: string) => {
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        },
        [setNodes, setEdges]
    );

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
            {/* Left panel - Node Palette */}
            {!readOnly && (
                <div style={{ width: 180, padding: 16, borderRight: '1px solid #e8e8e8' }}>
                    <WorkflowNodePalette onAddNode={handleAddNode} disableStart={hasStartNode} />
                </div>
            )}

            {/* Main canvas */}
            <div style={{ flex: 1, height: '100%' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={readOnly ? undefined : onNodesChange}
                    onEdgesChange={readOnly ? undefined : onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    onNodesDelete={(deleted) => {
                        deleted.forEach((n) => handleDeleteNode(n.id));
                    }}
                    nodesDraggable={!readOnly}
                    nodesConnectable={!readOnly}
                    elementsSelectable={true}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    deleteKeyCode={readOnly ? null : 'Delete'}
                >
                    <Controls showInteractive={!readOnly} />
                    <MiniMap
                        nodeColor={(node) => {
                            const typeColors: Record<WorkflowStepType, string> = {
                                START: '#1890ff',
                                USER_TASK: '#fa8c16',
                                REVIEW: '#52c41a',
                                END: '#ff4d4f',
                            };
                            return typeColors[(node.data as WorkflowNodeData)?.type] || '#888';
                        }}
                    />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>

            {/* Add Node Modal */}
            <Modal
                title={`Add ${pendingNodeType?.replace('_', ' ')} Step`}
                open={isAddNodeModalOpen}
                onOk={handleNodeNameSubmit}
                onCancel={() => {
                    setIsAddNodeModalOpen(false);
                    setPendingNodeType(null);
                }}
                okText="Add"
            >
                <Form form={nodeNameForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="name"
                        label="Step Name"
                        rules={[{ required: true, message: 'Please enter step name' }]}
                    >
                        <Input placeholder="Enter step name" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Reject Target Selection Modal */}
            <Modal
                title="Set Reject Target"
                open={isRejectTargetModalOpen}
                onOk={handleRejectTargetSubmit}
                onCancel={() => {
                    setIsRejectTargetModalOpen(false);
                    setPendingReviewConnection(null);
                }}
                okText="Confirm"
            >
                <Form form={rejectTargetForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="targetNodeId"
                        label="On Reject, return to:"
                        rules={[{ required: true, message: 'Please select target step' }]}
                    >
                        <Select placeholder="Select step to return to on reject">
                            {getRejectTargetOptions().map((node) => (
                                <Select.Option key={node.id} value={node.id}>
                                    {node.data.name} ({node.data.type.replace('_', ' ')})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

// Export functions for external use
export const getWorkflowData = (nodes: Node<WorkflowNodeData>[], edges: Edge[]) => ({
    steps: nodesToSteps(nodes),
    transitions: edgesToTransitions(edges),
});

export default WorkflowCanvas;
