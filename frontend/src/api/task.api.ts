import { Task, TaskStatus, TaskPriority } from '../types/task';

const MOCK_USERS = [
    { id: '1', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    { id: '2', name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
    { id: '3', name: 'Bob Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
];

const generateMockTasks = (count: number): Task[] => {
    return Array.from({ length: count }).map((_, index) => ({
        id: `TASK-${index + 1}`,
        title: `Task ${index + 1} - ${['Fix bug', 'Implement feature', 'Design review', 'Update docs'][Math.floor(Math.random() * 4)]}`,
        status: ['todo', 'in-progress', 'review', 'done'][Math.floor(Math.random() * 4)] as TaskStatus,
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as TaskPriority,
        assignees: MOCK_USERS.slice(0, Math.floor(Math.random() * 3) + 1),
        dueDate: new Date(Date.now() + Math.random() * 1000000000).toISOString(),
        createdAt: new Date().toISOString(),
    }));
};

const MOCK_TASKS = generateMockTasks(50);

export const fetchTasks = async (): Promise<Task[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_TASKS;
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newTask: Task = {
        id: `TASK-${MOCK_TASKS.length + 1}`,
        title: task.title || 'New Task',
        status: 'todo',
        priority: 'medium',
        assignees: [],
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        ...task,
    } as Task;
    MOCK_TASKS.unshift(newTask);
    return newTask;
};
