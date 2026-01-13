import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, message, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Node, Edge, useNodesState, useEdgesState, addEdge, Connection, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import ReactFlow, { Controls, Background, MiniMap, BackgroundVariant } from 'reactflow';

import WorkflowNode, { WorkflowNodeData } from '../../components/workflow/WorkflowNode';
import WorkflowNodePalette from '../../components/workflow/WorkflowNodePalette';
import WorkflowEdge from '../../components/workflow/WorkflowEdge';
import {
    getWorkflowById,
    createWorkflow,
    updateWorkflow,
    WorkflowStepType,
    WorkflowStepResponse,
    WorkflowTransitionResponse,
    CreateWorkflowRequest,
    UpdateWorkflowRequest,
} from '../../api/workflow.api';
import { Modal, Form } from 'antd';

// Node types
const nodeTypes = {
    workflowNode: WorkflowNode,
};

// Edge types
const edgeTypes = {
    workflowEdge: WorkflowEdge,
};

// Counter for generating unique node IDs
let nodeIdCounter = 0;
const generateNodeId = () => `node_${Date.now()}_${nodeIdCounter++}`;

// Convert API steps to ReactFlow nodes
const stepsToNodes = (steps: WorkflowStepResponse[]): Node<WorkflowNodeData>[] => {
    return steps.map((step, index) => ({
        id: step.id.toString(),
        type: 'workflowNode',
        data: {
            name: step.name,
            type: step.type,
        },
        position: {
            x: (step.stepOrder ?? index) * 250 + 100,
            y: 150,
        },
    }));
};

// Convert API transitions to ReactFlow edges
const transitionsToEdges = (transitions: WorkflowTransitionResponse[]): Edge[] => {
    return transitions.map((transition) => ({
        id: `edge_${transition.fromStepId}_${transition.toStepId}`,
        source: transition.fromStepId.toString(),
        target: transition.toStepId.toString(),
        label: transition.action,
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#888',
        },
        style: { stroke: '#888', strokeWidth: 2 },
        labelStyle: { fill: '#666', fontSize: 12 },
    }));
};

const WorkflowEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // id is undefined for /workflows/new route, or 'new' if using :id param
    const isNewWorkflow = !id || id === 'new';
    const parsedId = id ? Number(id) : NaN;
    const workflowId = isNewWorkflow || isNaN(parsedId) ? null : parsedId;

    // Workflow name state
    const [workflowName, setWorkflowName] = React.useState('New Workflow');
    const [workflowDescription, setWorkflowDescription] = React.useState('');

    // ReactFlow state
    const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Modal states
    const [isAddNodeModalOpen, setIsAddNodeModalOpen] = React.useState(false);
    const [pendingNodeType, setPendingNodeType] = React.useState<WorkflowStepType | null>(null);
    const [nodeNameForm] = Form.useForm();

    const [isEdgeLabelModalOpen, setIsEdgeLabelModalOpen] = React.useState(false);
    const [pendingConnection, setPendingConnection] = React.useState<Connection | null>(null);
    const [edgeLabelForm] = Form.useForm();

    // Fetch workflow data if editing
    const { data: workflowData, isLoading } = useQuery({
        queryKey: ['workflow', workflowId],
        queryFn: () => getWorkflowById(workflowId!),
        enabled: !isNewWorkflow && workflowId !== null && workflowId > 0,
    });

    // Update state when workflow data is loaded
    useEffect(() => {
        if (workflowData) {
            setWorkflowName(workflowData.name);
            setWorkflowDescription(workflowData.description || '');
            setNodes(stepsToNodes(workflowData.steps));
            setEdges(transitionsToEdges(workflowData.transitions));
        }
    }, [workflowData, setNodes, setEdges]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createWorkflow,
        onSuccess: (data) => {
            message.success('Workflow created successfully');
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            navigate(`/admin/workflows/${data.id}`);
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to create workflow');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateWorkflowRequest }) =>
            updateWorkflow(id, data),
        onSuccess: () => {
            message.success('Workflow updated successfully');
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to update workflow');
        },
    });

    // Check if START node exists
    const hasStartNode = nodes.some((n) => n.data.type === 'START');

    // Validate workflow
    const validateWorkflow = (): string | null => {
        const startNodes = nodes.filter((n) => n.data.type === 'START');
        if (startNodes.length === 0) return 'Workflow must have exactly one START step';
        if (startNodes.length > 1) return 'Workflow can only have one START step';

        const endNodes = nodes.filter((n) => n.data.type === 'END');
        if (endNodes.length === 0) return 'Workflow must have at least one END step';

        if (nodes.length > 1) {
            const connectedNodes = new Set<string>();
            edges.forEach((edge) => {
                connectedNodes.add(edge.source);
                connectedNodes.add(edge.target);
            });
            if (connectedNodes.size < nodes.length) {
                return 'All steps must be connected with transitions';
            }
        }

        return null;
    };

    // Handle save
    const handleSave = () => {
        const error = validateWorkflow();
        if (error) {
            message.error(error);
            return;
        }

        const steps = nodes.map((node, index) => ({
            clientId: node.id,
            name: node.data.name,
            type: node.data.type,
            stepOrder: index,
        }));

        const transitions = edges.map((edge) => ({
            from: edge.source,
            to: edge.target,
            action: (edge.label as string) || 'next',
        }));

        if (isNewWorkflow) {
            const request: CreateWorkflowRequest = {
                name: workflowName,
                description: workflowDescription || undefined,
                steps,
                transitions,
            };
            createMutation.mutate(request);
        } else {
            if (!workflowId) {
                message.error('Invalid workflow ID');
                return;
            }
            const request: UpdateWorkflowRequest = {
                name: workflowName,
                description: workflowDescription || undefined,
                steps,
                transitions,
            };
            updateMutation.mutate({ id: workflowId, data: request });
        }
    };

    // Handle connection
    const onConnect = useCallback(
        (connection: Connection) => {
            // Show modal to enter action name
            setPendingConnection(connection);
            edgeLabelForm.resetFields();
            setIsEdgeLabelModalOpen(true);
        },
        [edgeLabelForm]
    );

    const handleEdgeLabelSubmit = async () => {
        if (!pendingConnection) return;
        try {
            const values = await edgeLabelForm.validateFields();
            const newEdge: Edge = {
                id: `edge_${pendingConnection.source}_${pendingConnection.target}`,
                source: pendingConnection.source!,
                target: pendingConnection.target!,
                label: values.action,
                markerEnd: { type: MarkerType.ArrowClosed, color: '#888' },
                style: { stroke: '#888', strokeWidth: 2 },
                labelStyle: { fill: '#666', fontSize: 12 },
            };
            setEdges((eds) => addEdge(newEdge, eds));
            setIsEdgeLabelModalOpen(false);
            setPendingConnection(null);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Handle delete edge
    const handleDeleteEdge = useCallback(
        (edgeId: string) => {
            setEdges((eds) => eds.filter((e) => e.id !== edgeId));
        },
        [setEdges]
    );

    // Handle delete node
    const handleDeleteNode = useCallback(
        (nodeId: string) => {
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            // Also remove all edges connected to this node
            setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        },
        [setNodes, setEdges]
    );

    // Handle set reject target for REVIEW nodes
    const handleSetRejectTarget = useCallback(
        (sourceNodeId: string, targetNodeId: string) => {
            // Remove existing reject edge from this source if any
            setEdges((eds) => eds.filter(
                (e) => !(e.source === sourceNodeId && (e.label as string)?.toLowerCase() === 'reject')
            ));
            // Add new reject edge
            const newEdge: Edge = {
                id: `edge_${sourceNodeId}_reject_${targetNodeId}`,
                source: sourceNodeId,
                target: targetNodeId,
                label: 'reject',
                markerEnd: { type: MarkerType.ArrowClosed, color: '#ff4d4f' },
                style: { stroke: '#ff4d4f', strokeWidth: 2 },
                labelStyle: { fill: '#ff4d4f', fontSize: 12 },
            };
            setEdges((eds) => addEdge(newEdge, eds));
        },
        [setEdges]
    );

    // Handle remove reject target for REVIEW nodes
    const handleRemoveRejectTarget = useCallback(
        (sourceNodeId: string) => {
            setEdges((eds) => eds.filter(
                (e) => !(e.source === sourceNodeId && (e.label as string)?.toLowerCase() === 'reject')
            ));
        },
        [setEdges]
    );


    // Handle add node
    const handleAddNode = (type: WorkflowStepType) => {
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
                data: { name: values.name, type: pendingNodeType },
                position: { x: Math.random() * 400 + 200, y: Math.random() * 200 + 100 },
            };
            setNodes((nds) => [...nds, newNode]);
            setIsAddNodeModalOpen(false);
            setPendingNodeType(null);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    if (!isNewWorkflow && isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderBottom: '1px solid #e8e8e8',
                    background: '#fff',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/workflows')}
                    >
                        Back
                    </Button>
                    <Input
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        style={{ width: 250, fontSize: 18, fontWeight: 600 }}
                        placeholder="Workflow Name"
                    />
                    <Input
                        value={workflowDescription}
                        onChange={(e) => setWorkflowDescription(e.target.value)}
                        style={{ width: 350 }}
                        placeholder="Description (optional)"
                    />
                </div>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={createMutation.isPending || updateMutation.isPending}
                >
                    Save
                </Button>
            </div>

            {/* Main content */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left panel - Node Palette */}
                <div style={{ width: 180, padding: 16, borderRight: '1px solid #e8e8e8', background: '#fafafa' }}>
                    <WorkflowNodePalette onAddNode={handleAddNode} disableStart={hasStartNode} />
                </div>

                {/* ReactFlow Canvas */}
                <div style={{ flex: 1, height: '100%' }}>
                    <ReactFlow
                        nodes={nodes.map((n) => {
                            // Build transitions data for this node
                            const nodeTransitions = edges
                                .filter((e) => e.source === n.id)
                                .map((e) => {
                                    const targetNode = nodes.find((node) => node.id === e.target);
                                    return {
                                        action: (e.label as string) || 'next',
                                        targetNodeId: e.target,
                                        targetNodeName: targetNode?.data.name || 'Unknown',
                                    };
                                });
                            // Build available nodes list for reject dropdown (exclude END nodes)
                            const availableNodes = nodes
                                .filter((node) => node.data.type !== 'END')
                                .map((node) => ({ id: node.id, name: node.data.name }));
                            return {
                                ...n,
                                data: {
                                    ...n.data,
                                    onDelete: handleDeleteNode,
                                    transitions: nodeTransitions,
                                    availableNodes: n.data.type === 'REVIEW' ? availableNodes : undefined,
                                    onSetRejectTarget: n.data.type === 'REVIEW' ? handleSetRejectTarget : undefined,
                                    onRemoveRejectTarget: n.data.type === 'REVIEW' ? handleRemoveRejectTarget : undefined,
                                },
                            };
                        })}
                        edges={edges
                            // Filter out reject edges - they are shown in node UI instead
                            .filter((e) => (e.label as string)?.toLowerCase() !== 'reject')
                            .map((e) => ({
                                ...e,
                                type: 'workflowEdge',
                                data: { ...e.data, onDelete: handleDeleteEdge },
                            }))}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        deleteKeyCode="Delete"
                    >
                        <Controls />
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

            {/* Edge Label Modal */}
            <Modal
                title="Add Transition"
                open={isEdgeLabelModalOpen}
                onOk={handleEdgeLabelSubmit}
                onCancel={() => {
                    setIsEdgeLabelModalOpen(false);
                    setPendingConnection(null);
                }}
                okText="Add"
            >
                <Form form={edgeLabelForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="action"
                        label="Action Name"
                        rules={[{ required: true, message: 'Please enter action name' }]}
                    >
                        <Input placeholder="e.g., submit, approve, reject" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default WorkflowEditorPage;
