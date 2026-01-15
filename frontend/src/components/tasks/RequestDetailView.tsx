import React, { useMemo, useState } from 'react';
import {
    Modal,
    Typography,
    Card,
    Space,
    Button,
    Form,
    Input,
    Divider,
    List,
    Avatar,
    Spin,
    Empty,
    message,
    Upload,
} from 'antd';
import {
    ClockCircleOutlined,
    UserOutlined,
    CheckOutlined,
    CloseOutlined,
    SendOutlined,
    UploadOutlined,
    DeleteOutlined,
    FileTextOutlined,
    FileOutlined,
    DownloadOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { 
    TaskResponse, 
    isUserAssignee, 
    getTaskActions, 
    executeAction, 
    ExecuteActionRequest,
    getCurrentStepTask,
    getStepTaskDetail,
    StepTaskDetailResponse,
    StepTaskDataResponse,
    StepTaskFileResponse,
} from '../../api/task.api';
import { getWorkflowById } from '../../api/workflow.api';
import WorkflowCanvas from '../workflow/WorkflowCanvas';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface RequestDetailViewProps {
    task: TaskResponse | null;
    open: boolean;
    onClose: () => void;
}


const RequestDetailView: React.FC<RequestDetailViewProps> = ({ task, open, onClose }) => {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [selectedStepTaskId, setSelectedStepTaskId] = useState<number | null>(null);
    const [stepTaskDetail, setStepTaskDetail] = useState<StepTaskDetailResponse | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Fetch workflow details for canvas
    const { data: workflowDetail, isLoading: workflowLoading } = useQuery({
        queryKey: ['workflow-detail-for-task', task?.workflowId],
        queryFn: () => getWorkflowById(task!.workflowId!),
        enabled: !!task?.workflowId,
    });

    // Check if current user is assignee of current step
    const { data: isCurrentStepAssignee = false, isLoading: isCheckingAssignee } = useQuery({
        queryKey: ['is-user-assignee', task?.id],
        queryFn: () => isUserAssignee(task!.id),
        enabled: !!task?.id,
    });

    // Fetch current step task to get assignee info
    const { data: currentStepTask, isLoading: currentStepTaskLoading } = useQuery({
        queryKey: ['current-step-task', task?.id],
        queryFn: () => getCurrentStepTask(task!.id),
        enabled: !!task?.id,
    });

    // Fetch activity log
    const { data: activityLog = [], isLoading: activityLoading } = useQuery({
        queryKey: ['task-actions', task?.id],
        queryFn: () => getTaskActions(task!.id),
        enabled: !!task?.id,
    });

    // Get current step details
    const currentStep = useMemo(() => {
        if (!workflowDetail || !task?.currentStepId) return null;
        return workflowDetail.steps.find((s) => s.id === task.currentStepId);
    }, [workflowDetail, task]);

    // Execute action mutation
    const executeActionMutation = useMutation({
        mutationFn: ({ taskId, request }: { taskId: number; request: ExecuteActionRequest }) =>
            executeAction(taskId, request),
        onSuccess: () => {
            message.success('Action executed successfully');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task-actions'] });
            queryClient.invalidateQueries({ queryKey: ['is-user-assignee'] });
            queryClient.invalidateQueries({ queryKey: ['current-step-task'] });
            queryClient.invalidateQueries({ queryKey: ['workflow-detail-for-task'] });
            queryClient.invalidateQueries({ queryKey: ['my-assigned-step-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['my-assigned-step-tasks-workspace'] });
            // Refresh task data by invalidating the task query
            if (task) {
                queryClient.invalidateQueries({ queryKey: ['task', task.id] });
            }
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to execute action');
        },
    });

    const handleAction = async (action: string) => {
        if (!task) return;
        
        try {
            const values = await form.validateFields();
            
            // Prepare file upload requests
            const fileUploadRequests = fileList
                .filter(file => file.originFileObj)
                .map(file => ({
                    fileName: file.name,
                    objectName: `task-${task.id}/${file.uid}-${file.name}`, // Temporary object name until Minio is implemented
                    fileSize: file.size || 0,
                }));

            const request: ExecuteActionRequest = {
                actionName: action.toLowerCase(),
                comment: values.comment || undefined,
                dataBody: values.dataBody || undefined,
                files: fileUploadRequests.length > 0 ? fileUploadRequests : undefined,
            };
            executeActionMutation.mutate({ taskId: task.id, request });
            form.resetFields(['comment', 'dataBody']);
            setFileList([]);
        } catch (error) {
            // Validation failed or no comment field
            const request: ExecuteActionRequest = {
                actionName: action.toLowerCase(),
            };
            executeActionMutation.mutate({ taskId: task.id, request });
        }
    };

    // Convert StepTaskActionResponse to ActivityEntry format
    interface ActivityEntry {
        id: string;
        timestamp: string;
        actor: string;
        action: string;
        comment?: string;
        stepTaskId?: number | null;
    }

    const activityEntries = useMemo<ActivityEntry[]>(() => {
        if (!activityLog.length) {
            // Fallback: create initial entry from task
            if (task) {
                return [{
                    id: '0',
                    timestamp: task.createdAt,
                    actor: task.creatorName || 'System',
                    action: 'Request created',
                }];
            }
            return [];
        }
        
        return activityLog.map((action) => ({
            id: action.id.toString(),
            timestamp: action.createdAt,
            actor: action.actorName,
            action: `${action.actionName}${action.toStepName ? ` → ${action.toStepName}` : ''}`,
            comment: action.comment || undefined,
            stepTaskId: action.stepTaskId,
        }));
    }, [activityLog, task]);

    const handleActivityItemClick = async (stepTaskId: number | null) => {
        if (!stepTaskId) return;
        
        setSelectedStepTaskId(stepTaskId);
        setLoadingDetail(true);
        try {
            const detail = await getStepTaskDetail(stepTaskId);
            setStepTaskDetail(detail);
        } catch (error) {
            message.error('Failed to load step task details');
        } finally {
            setLoadingDetail(false);
        }
    };

    const formatFileSize = (bytes: number | null): string => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    if (!task) return null;

    return (
        <Modal
            title={null}
            open={open}
            onCancel={() => {
                form.resetFields();
                setFileList([]);
                onClose();
            }}
            footer={null}
            width={1400}
            style={{ top: 20 }}
            bodyStyle={{ padding: 0, maxHeight: 'calc(100vh - 40px)', overflow: 'hidden' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
                {/* Header - Minimal */}
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Title level={3} style={{ margin: 0 }}>
                            {task.title}
                        </Title>
                    </Space>
                </div>

                {/* Main Content - Two Column Layout */}
                <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                    {/* Step Action Panel - Primary */}
                    <div style={{ flex: '0 0 400px', borderRight: '1px solid #e5e7eb', padding: '24px', overflow: 'auto' }}>
                        {(workflowLoading || isCheckingAssignee || currentStepTaskLoading) ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <Spin size="large" />
                            </div>
                        ) : currentStep ? (
                            <Card
                                title={
                                    <Space>
                                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                        <span style={{ fontWeight: 600, fontSize: 16 }}>
                                            {currentStep.name}
                                        </span>
                                    </Space>
                                }
                                bordered={false}
                                style={{ marginBottom: 16 }}
                            >
                                {currentStep.description && (
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                        {currentStep.description}
                                    </Text>
                                )}

                                {isCurrentStepAssignee ? (
                                    // Case A: User IS assignee - Show actionable panel
                                    <div>
                                        <Divider style={{ margin: '16px 0' }} />
                                        
                                        <Form form={form} layout="vertical" style={{ marginBottom: 16 }}>
                                            {/* Data Body Input (for USER_TASK) */}
                                            {currentStep.type === 'USER_TASK' && (
                                                <Form.Item name="dataBody" label="Input">
                                                    <TextArea rows={3} placeholder="Enter your input..." />
                                                </Form.Item>
                                            )}

                                            {/* File Upload */}
                                            <Form.Item label="Attachments">
                                                <Upload
                                                    fileList={fileList}
                                                    onChange={({ fileList: newFileList }) => {
                                                        setFileList(newFileList);
                                                    }}
                                                    beforeUpload={() => false}
                                                    multiple
                                                >
                                                    <Button icon={<UploadOutlined />}>Upload File</Button>
                                                </Upload>
                                                {fileList.length > 0 && (
                                                    <div style={{ marginTop: 8 }}>
                                                        {fileList.map(file => (
                                                            <div key={file.uid} style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between', 
                                                                alignItems: 'center',
                                                                padding: '4px 0',
                                                                fontSize: 12,
                                                                color: '#595959'
                                                            }}>
                                                                <span>{file.name}</span>
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={() => {
                                                                        setFileList(fileList.filter(f => f.uid !== file.uid));
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </Form.Item>

                                            {/* Comment Input */}
                                            <Form.Item name="comment" label="Comment">
                                                <TextArea
                                                    rows={2}
                                                    placeholder="Add a comment (optional)"
                                                />
                                            </Form.Item>
                                        </Form>

                                        {/* Action Buttons */}
                                        <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                            {currentStep.type === 'USER_TASK' && (
                                                    <Button
                                                        type="primary"
                                                        icon={<SendOutlined />}
                                                        block
                                                        onClick={() => handleAction('submit')}
                                                        loading={executeActionMutation.isPending}
                                                    >
                                                        Submit
                                                    </Button>
                                            )}
                                            
                                            {currentStep.type === 'REVIEW' && (
                                                <>
                                                    <Button
                                                        type="primary"
                                                        icon={<CheckOutlined />}
                                                        block
                                                        onClick={() => handleAction('approve')}
                                                        loading={executeActionMutation.isPending}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        danger
                                                        icon={<CloseOutlined />}
                                                        block
                                                        onClick={() => handleAction('reject')}
                                                        loading={executeActionMutation.isPending}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </Space>
                                    </div>
                                ) : (
                                    // Case B: User is NOT assignee - Show waiting state
                                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                        <ClockCircleOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                                        <Text type="secondary" style={{ display: 'block', fontSize: 14 }}>
                                            Waiting for: {currentStepTask?.assignedUserName || currentStep.assigneeName || 'Assignee'}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                                            You have no action at this step.
                                        </Text>
                                    </div>
                                )}
                            </Card>
                        ) : (
                            <Empty description="No current step information" />
                        )}
                    </div>

                    {/* Process Context - Workflow Canvas - Secondary */}
                    <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
                        {workflowLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <Spin size="large" />
                            </div>
                        ) : workflowDetail ? (
                            <Card
                                title="Process Context"
                                bordered={false}
                                style={{ height: '100%' }}
                                bodyStyle={{ height: 'calc(100% - 57px)', padding: 0 }}
                            >
                                <div style={{ height: '100%', minHeight: 400 }}>
                                    <WorkflowCanvas
                                        initialSteps={workflowDetail.steps}
                                        initialTransitions={workflowDetail.transitions}
                                        readOnly={true}
                                        onNodeClick={undefined}
                                    />
                                </div>
                            </Card>
                        ) : (
                            <Empty description="No workflow information" />
                        )}
                    </div>
                </div>

                {/* Activity / History Panel */}
                <div style={{ borderTop: '1px solid #e5e7eb', padding: '24px', maxHeight: '300px', overflow: 'auto' }}>
                    <Title level={5} style={{ marginBottom: 16 }}>
                        Activity / History
                    </Title>
                    {activityLoading ? (
                        <div style={{ textAlign: 'center', padding: 20 }}>
                            <Spin />
                        </div>
                    ) : activityEntries.length > 0 ? (
                        <List
                            dataSource={activityEntries}
                            renderItem={(item) => (
                                <List.Item 
                                    style={{ 
                                        padding: '12px 0', 
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: item.stepTaskId ? 'pointer' : 'default',
                                    }}
                                    onClick={() => item.stepTaskId && handleActivityItemClick(item.stepTaskId)}
                                    onMouseEnter={(e) => {
                                        if (item.stepTaskId) {
                                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (item.stepTaskId) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                                        }
                                        title={
                                            <Space>
                                                <Text strong>{item.actor}</Text>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {dayjs(item.timestamp).format('YYYY-MM-DD HH:mm')}
                                                </Text>
                                                {item.stepTaskId && (
                                                    <EyeOutlined style={{ fontSize: 12, color: '#1890ff', marginLeft: 8 }} />
                                                )}
                                            </Space>
                                        }
                                        description={
                                            <Space>
                                                <Text>{item.action}</Text>
                                                {item.comment && (
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        - {item.comment}
                                                    </Text>
                                                )}
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description="No activity recorded" />
                    )}
                </div>
            </div>

            {/* Step Task Detail Modal */}
            <Modal
                title={
                    <Space>
                        <FileTextOutlined />
                        <span>Step Task Details</span>
                    </Space>
                }
                open={!!selectedStepTaskId}
                onCancel={() => {
                    setSelectedStepTaskId(null);
                    setStepTaskDetail(null);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setSelectedStepTaskId(null);
                        setStepTaskDetail(null);
                    }}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {loadingDetail ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin size="large" />
                    </div>
                ) : stepTaskDetail ? (
                    <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
                        {/* Step Information */}
                        <Card 
                            size="small" 
                            style={{ marginBottom: 16 }}
                            title={
                                <Space>
                                    <ClockCircleOutlined />
                                    <span>{stepTaskDetail.stepTask.workflowStepName}</span>
                                </Space>
                            }
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Status: </Text>
                                    <Text strong>{stepTaskDetail.stepTask.status}</Text>
                                </div>
                                {stepTaskDetail.stepTask.assignedUserName && (
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Assigned to: </Text>
                                        <Text>{stepTaskDetail.stepTask.assignedUserName}</Text>
                                    </div>
                                )}
                                {stepTaskDetail.stepTask.beginDate && (
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Started: </Text>
                                        <Text>{dayjs(stepTaskDetail.stepTask.beginDate).format('YYYY-MM-DD HH:mm')}</Text>
                                    </div>
                                )}
                                {stepTaskDetail.stepTask.endDate && (
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Completed: </Text>
                                        <Text>{dayjs(stepTaskDetail.stepTask.endDate).format('YYYY-MM-DD HH:mm')}</Text>
                                    </div>
                                )}
                            </Space>
                        </Card>

                        {/* Comment Section */}
                        {stepTaskDetail.comment && (
                            <Card 
                                size="small" 
                                style={{ marginBottom: 16 }}
                                title={
                                    <Space>
                                        <UserOutlined />
                                        <span>Comment</span>
                                    </Space>
                                }
                            >
                                <Text>{stepTaskDetail.comment}</Text>
                            </Card>
                        )}

                        {/* Data Section */}
                        {stepTaskDetail.data && stepTaskDetail.data.length > 0 && (
                            <Card 
                                size="small" 
                                style={{ marginBottom: 16 }}
                                title={
                                    <Space>
                                        <FileTextOutlined />
                                        <span>Input Data ({stepTaskDetail.data.length})</span>
                                    </Space>
                                }
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                    {stepTaskDetail.data.map((dataItem: StepTaskDataResponse) => (
                                        <Card 
                                            key={dataItem.id}
                                            size="small"
                                            style={{ backgroundColor: '#fafafa' }}
                                        >
                                            <Space direction="vertical" style={{ width: '100%' }} size={4}>
                                                {dataItem.dataBody && (
                                                    <Text style={{ whiteSpace: 'pre-wrap' }}>{dataItem.dataBody}</Text>
                                                )}
                                                <div style={{ marginTop: 8 }}>
                                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                                        {dataItem.createdByName} • {dayjs(dataItem.createdAt).format('YYYY-MM-DD HH:mm')}
                                                    </Text>
                                                </div>
                                            </Space>
                                        </Card>
                                    ))}
                                </Space>
                            </Card>
                        )}

                        {/* Files Section */}
                        {stepTaskDetail.files && stepTaskDetail.files.length > 0 && (
                            <Card 
                                size="small"
                                title={
                                    <Space>
                                        <FileOutlined />
                                        <span>Attachments ({stepTaskDetail.files.length})</span>
                                    </Space>
                                }
                            >
                                <List
                                    dataSource={stepTaskDetail.files}
                                    renderItem={(file: StepTaskFileResponse) => (
                                        <List.Item
                                            actions={[
                                                <Button 
                                                    key="download" 
                                                    type="link" 
                                                    icon={<DownloadOutlined />}
                                                    onClick={() => {
                                                        // TODO: Implement file download when Minio is ready
                                                        message.info('File download will be available when Minio is configured');
                                                    }}
                                                >
                                                    Download
                                                </Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<FileOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                                                title={file.fileName}
                                                description={
                                                    <Space>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {formatFileSize(file.fileSize)}
                                                        </Text>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>•</Text>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {file.uploadedByName} • {dayjs(file.createdAt).format('YYYY-MM-DD HH:mm')}
                                                        </Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        )}

                        {!stepTaskDetail.comment && (!stepTaskDetail.data || stepTaskDetail.data.length === 0) && 
                         (!stepTaskDetail.files || stepTaskDetail.files.length === 0) && (
                            <Empty description="No additional details available" />
                        )}
                    </div>
                ) : null}
            </Modal>
        </Modal>
    );
};

export default RequestDetailView;
