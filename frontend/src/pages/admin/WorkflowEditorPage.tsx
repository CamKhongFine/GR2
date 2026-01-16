import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, message, Spin, Select, Divider, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UserOutlined, TeamOutlined, PlayCircleOutlined, StopOutlined, CheckOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Node, Edge, useNodesState, useEdgesState, addEdge, Connection, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import ReactFlow, { Controls, Background, MiniMap, BackgroundVariant } from 'reactflow';

import WorkflowNode, { WorkflowNodeData } from '../../components/workflow/WorkflowNode';
import WorkflowNodePalette from '../../components/workflow/WorkflowNodePalette';
import WorkflowEdge from '../../components/workflow/WorkflowEdge';
import NodeConfigDrawer from '../../components/workflow/NodeConfigDrawer';
import {
    getWorkflowById,
    createWorkflow,
    updateWorkflow,
    WorkflowStepType,
    WorkflowStepResponse,
    WorkflowTransitionResponse,
    CreateWorkflowRequest,
    UpdateWorkflowRequest,
    AssigneeType,
} from '../../api/workflow.api';
import { fetchUsers } from '../../api/user.api';
import { Modal, Form } from 'antd';

const { Text } = Typography;

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
const stepsToNodes = (steps: WorkflowStepResponse[], users?: any[]): Node<WorkflowNodeData>[] => {
    return steps.map((step, index) => {
        let assigneeName = undefined;
        if (step.assigneeType === 'FIXED' && step.assigneeValue && users) {
            const user = users.find(u => u.id.toString() === step.assigneeValue);
            if (user) {
                assigneeName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
            }
        }

        return {
            id: step.id.toString(),
            type: 'workflowNode',
            data: {
                name: step.name,
                type: step.type,
                assigneeType: step.assigneeType,
                assigneeValue: step.assigneeValue,
                assigneeName: assigneeName,
            },
            position: {
                x: (step.stepOrder ?? index) * 250 + 100,
                y: 150,
            },
        };
    });
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
    const [selectedAssigneeType, setSelectedAssigneeType] = React.useState<AssigneeType>('DYNAMIC');

    const [isEdgeLabelModalOpen, setIsEdgeLabelModalOpen] = React.useState(false);
    const [pendingReviewConnection, setPendingReviewConnection] = React.useState<{
        sourceId: string;
        connection: Connection;
    } | null>(null);
    const [rejectTargetForm] = Form.useForm();

    // Node config drawer state
    const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
    const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

    // Fetch users with role level > 1 (Leaders, Managers, Admins) for assignee selection
    const { data: usersData } = useQuery({
        queryKey: ['users-for-assignee'],
        queryFn: () => fetchUsers(0, 100, undefined, undefined, 'ACTIVE', undefined, undefined, undefined, undefined),
    });

    // Fetch workflow data if editing
    const { data: workflowData, isLoading } = useQuery({
        queryKey: ['workflow', workflowId],
        queryFn: () => getWorkflowById(workflowId!),
        enabled: !isNewWorkflow && workflowId !== null && workflowId > 0,
    });

    // Update state when workflow data and users data are loaded
    useEffect(() => {
        if (workflowData) {
            setWorkflowName(workflowData.name);
            setWorkflowDescription(workflowData.description || '');
            setNodes(stepsToNodes(workflowData.steps, usersData?.content));
            setEdges(transitionsToEdges(workflowData.transitions));
        }
    }, [workflowData, usersData, setNodes, setEdges]);

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
            assigneeType: node.data.assigneeType,
            assigneeValue: node.data.assigneeValue,
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
        };
    };

    // Handle connection - auto-set edge names based on source node type
    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target) return;

            const sourceNode = nodes.find((n) => n.id === connection.source);
            const sourceType = sourceNode?.data.type;

            if (sourceType === 'START') {
                const newEdge = createEdge(connection.source, connection.target, 'start');
                setEdges((eds) => addEdge(newEdge, eds));
            } else if (sourceType === 'USER_TASK') {
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
                    setIsEdgeLabelModalOpen(true);
                }
            } else {
                const newEdge = createEdge(connection.source, connection.target, 'next');
                setEdges((eds) => addEdge(newEdge, eds));
            }
        },
        [nodes, edges, setEdges, rejectTargetForm]
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
            setIsEdgeLabelModalOpen(false);
            setPendingReviewConnection(null);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Get available nodes for reject target (previous steps, not START/END)
    const getRejectTargetOptions = () => {
        return nodes.filter((n) => n.data.type !== 'START' && n.data.type !== 'END');
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

    // Handle node click for config drawer
    const handleNodeClick = useCallback((nodeId: string) => {
        setSelectedNodeId(nodeId);
    }, []);

    // Handle node update from config drawer
    const handleNodeUpdate = useCallback(
        (nodeId: string, updates: Partial<WorkflowNodeData>) => {
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === nodeId
                        ? { ...n, data: { ...n.data, ...updates } }
                        : n
                )
            );
            setSelectedNodeId(null);
        },
        [setNodes]
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

        // START and END nodes are added directly with hardcoded names
        if (type === 'START' || type === 'END') {
            const newNode: Node<WorkflowNodeData> = {
                id: generateNodeId(),
                type: 'workflowNode',
                data: {
                    name: type === 'START' ? 'Start' : 'End',
                    type: type,
                },
                position: { x: Math.random() * 400 + 200, y: Math.random() * 200 + 100 },
            };
            setNodes((nds) => [...nds, newNode]);
            return;
        }

        // USER_TASK and REVIEW show modal for assignee configuration
        setPendingNodeType(type);
        nodeNameForm.resetFields();
        setSelectedAssigneeType('DYNAMIC');
        setIsAddNodeModalOpen(true);
    };

    const handleNodeNameSubmit = async () => {
        if (!pendingNodeType) return;
        try {
            const values = await nodeNameForm.validateFields();

            // Build node data with assignee configuration
            const nodeData: WorkflowNodeData = {
                name: values.name,
                type: pendingNodeType,
            };

            // Add assignee config for USER_TASK and REVIEW types
            const assigneeType = values.assigneeType || 'DYNAMIC';
            nodeData.assigneeType = assigneeType;
            nodeData.assigneeValue = assigneeType === 'FIXED' ? values.assigneeValue : null;

            // Store assignee name for display
            if (assigneeType === 'FIXED' && values.assigneeValue && usersData) {
                const selectedUser = usersData.content.find(u => u.id.toString() === values.assigneeValue);
                if (selectedUser) {
                    nodeData.assigneeName = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.email;
                }
            }

            const newNode: Node<WorkflowNodeData> = {
                id: generateNodeId(),
                type: 'workflowNode',
                data: nodeData,
                position: { x: Math.random() * 400 + 200, y: Math.random() * 200 + 100 },
            };
            setNodes((nds) => [...nds, newNode]);
            setIsAddNodeModalOpen(false);
            setPendingNodeType(null);
            setSelectedAssigneeType('DYNAMIC');
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
                                    onClick: handleNodeClick,
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
                title={null}
                open={isAddNodeModalOpen}
                onOk={handleNodeNameSubmit}
                onCancel={() => {
                    setIsAddNodeModalOpen(false);
                    setPendingNodeType(null);
                    setSelectedAssigneeType('DYNAMIC');
                }}
                okText="Add Step"
                cancelText="Cancel"
                width={520}
                bodyStyle={{ padding: 0 }}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: '20px 24px',
                        background: pendingNodeType === 'USER_TASK' ? '#f59e0b' :
                            pendingNodeType === 'REVIEW' ? '#10b981' :
                                pendingNodeType === 'START' ? '#4f46e5' : '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                    }}
                >
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            color: '#fff',
                        }}
                    >
                        {pendingNodeType === 'USER_TASK' ? <UserOutlined /> :
                            pendingNodeType === 'REVIEW' ? <TeamOutlined /> :
                                pendingNodeType === 'START' ? <PlayCircleOutlined /> :
                                    <StopOutlined />}
                    </div>
                    <div>
                        <Text style={{ fontSize: 18, fontWeight: 600, color: '#fff', display: 'block' }}>
                            Add {pendingNodeType?.replace('_', ' ')} Step
                        </Text>
                        <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>
                            {pendingNodeType === 'USER_TASK' ? 'A task that requires user action' :
                                pendingNodeType === 'REVIEW' ? 'An approval/review checkpoint' :
                                    pendingNodeType === 'START' ? 'The entry point of workflow' :
                                        'The completion point'}
                        </Text>
                    </div>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '24px' }}>
                    <Form form={nodeNameForm} layout="vertical">
                        {/* Step Name - hidden, auto-generated */}
                        <Form.Item
                            name="name"
                            initialValue={pendingNodeType === 'USER_TASK' ? 'User Task' : 'Review'}
                            hidden
                        >
                            <Input />
                        </Form.Item>

                        {/* Assignee Configuration */}
                        <Form.Item
                            name="assigneeType"
                            initialValue="DYNAMIC"
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {/* Dynamic Option */}
                                <div
                                    onClick={() => {
                                        setSelectedAssigneeType('DYNAMIC');
                                        nodeNameForm.setFieldValue('assigneeType', 'DYNAMIC');
                                        nodeNameForm.setFieldValue('assigneeValue', null);
                                    }}
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: 10,
                                        border: `2px solid ${selectedAssigneeType === 'DYNAMIC' ? '#3b82f6' : '#e5e7eb'}`,
                                        background: selectedAssigneeType === 'DYNAMIC' ? '#eff6ff' : '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            background: selectedAssigneeType === 'DYNAMIC' ? '#3b82f6' : '#e5e7eb',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <UserOutlined style={{ fontSize: 18, color: '#fff' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Text strong style={{ display: 'block', color: '#1f2937' }}>
                                            Dynamic Assignment
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Assignee will be selected when task is created
                                        </Text>
                                    </div>
                                    {selectedAssigneeType === 'DYNAMIC' && (
                                        <div style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            background: '#3b82f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <CheckOutlined style={{ fontSize: 12, color: '#fff' }} />
                                        </div>
                                    )}
                                </div>

                                {/* Fixed Option */}
                                <div
                                    onClick={() => {
                                        setSelectedAssigneeType('FIXED');
                                        nodeNameForm.setFieldValue('assigneeType', 'FIXED');
                                    }}
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: 10,
                                        border: `2px solid ${selectedAssigneeType === 'FIXED' ? '#10b981' : '#e5e7eb'}`,
                                        background: selectedAssigneeType === 'FIXED' ? '#ecfdf5' : '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            background: selectedAssigneeType === 'FIXED' ? '#10b981' : '#e5e7eb',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <UserOutlined style={{ fontSize: 18, color: '#fff' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Text strong style={{ display: 'block', color: '#1f2937' }}>
                                            Fixed Assignment
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Always assigned to a specific user
                                        </Text>
                                    </div>
                                    {selectedAssigneeType === 'FIXED' && (
                                        <div style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            background: '#10b981',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <CheckOutlined style={{ fontSize: 12, color: '#fff' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Form.Item>

                        {selectedAssigneeType === 'FIXED' && (
                            <Form.Item
                                name="assigneeValue"
                                label={<Text style={{ fontSize: 12, color: '#6b7280' }}>Select {pendingNodeType === 'USER_TASK' ? 'Assignee' : 'Reviewer'}</Text>}
                                rules={[{ required: true, message: 'Please select a user' }]}
                                style={{ marginTop: 16 }}
                            >
                                <Select
                                    showSearch
                                    placeholder="Search and select user"
                                    optionFilterProp="label"
                                    loading={!usersData}
                                    size="middle"
                                    style={{ borderRadius: 8 }}
                                    options={
                                        usersData?.content.map((user) => ({
                                            value: user.id.toString(),
                                            label: `${user.firstName || ''} ${user.lastName || ''} (${user.email})`.trim(),
                                        })) || []
                                    }
                                />
                            </Form.Item>
                        )}
                    </Form>
                </div>
            </Modal>

            {/* Reject Target Selection Modal */}
            <Modal
                title="Set Reject Target"
                open={isEdgeLabelModalOpen}
                onOk={handleRejectTargetSubmit}
                onCancel={() => {
                    setIsEdgeLabelModalOpen(false);
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

            {/* Node Config Drawer */}
            <NodeConfigDrawer
                open={!!selectedNodeId}
                nodeId={selectedNodeId}
                nodeData={selectedNode?.data || null}
                users={
                    usersData?.content.map((user) => ({
                        id: user.id.toString(),
                        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                        email: user.email,
                    })) || []
                }
                availableNodes={nodes.map((n) => ({
                    id: n.id,
                    name: n.data.name,
                    type: n.data.type,
                }))}
                currentRejectTarget={
                    selectedNodeId
                        ? edges.find(
                            (e) => e.source === selectedNodeId && e.label?.toString().toLowerCase() === 'reject'
                        )?.target
                        : undefined
                }
                onSave={handleNodeUpdate}
                onClose={() => setSelectedNodeId(null)}
                onDelete={handleDeleteNode}
                onSetRejectTarget={handleSetRejectTarget}
                onRemoveRejectTarget={handleRemoveRejectTarget}
            />
        </div>
    );
};

export default WorkflowEditorPage;
