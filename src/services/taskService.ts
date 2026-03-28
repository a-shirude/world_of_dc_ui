import api from "./api";
import { Department } from "../constants/enums";
import { ApiResponse } from "../types";
import {
  AddTaskCommentInput,
  CreateTaskInput,
  Task,
  TaskActivity,
  TaskAssignee,
  TaskComment,
  TaskStatus,
  UpdateTaskInput,
} from "../types/taskTypes";

type CurrentUser = {
  id: string;
  name: string;
  department?: Department;
};

const unwrapData = <T>(payload: unknown): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    ("success" in payload || "message" in payload)
  ) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
};

const safeArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const parseDepartment = (value: unknown): Department => {
  const maybe = String(value || "").toUpperCase();
  return (Object.values(Department).includes(maybe as Department)
    ? maybe
    : Department.UNASSIGNED) as Department;
};

const parseStatus = (value: unknown): TaskStatus => {
  const maybe = String(value || "OPEN").toUpperCase();
  const allowed: TaskStatus[] = ["OPEN", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"];
  return allowed.includes(maybe as TaskStatus) ? (maybe as TaskStatus) : "OPEN";
};

const normalizeComment = (raw: any): TaskComment => ({
  id: String(raw?.id || raw?.commentId || `comment-${Date.now()}`),
  taskId: String(raw?.taskId || raw?.task?.id || ""),
  text: String(raw?.text || raw?.comment || raw?.message || ""),
  authorId: String(raw?.authorId || raw?.commenterId || raw?.createdById || ""),
  authorName: String(raw?.authorName || raw?.commenterName || raw?.createdByName || "Unknown"),
  createdAt: String(raw?.createdAt || raw?.createdOn || new Date().toISOString()),
});

const normalizeActivity = (raw: any, taskId: string): TaskActivity => ({
  id: String(raw?.id || raw?.workflowId || `wf-${Date.now()}`),
  taskId,
  action: String(raw?.action || raw?.event || raw?.status || "Task updated"),
  actorName: String(raw?.actorName || raw?.performedByName || raw?.createdByName || "System"),
  createdAt: String(raw?.createdAt || raw?.timestamp || raw?.createdOn || new Date().toISOString()),
});

const normalizeTask = (raw: any): Task => {
  const taskId = String(raw?.id || raw?.taskId || "");
  return {
    id: taskId,
    taskNumber: String(raw?.taskNumber || raw?.number || raw?.taskNo || taskId),
    title: String(raw?.title || raw?.subject || "Untitled Task"),
    description: String(raw?.description || ""),
    department: parseDepartment(raw?.department),
    scope: raw?.scope === "DEPARTMENT" ? "DEPARTMENT" : "SELF",
    status: parseStatus(raw?.status),
    priority: ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(String(raw?.priority || "").toUpperCase())
      ? String(raw?.priority).toUpperCase()
      : "MEDIUM",
    createdById: String(raw?.createdById || raw?.createdBy?.id || ""),
    createdByName: String(raw?.createdByName || raw?.createdBy?.name || "System"),
    assignedToId: raw?.assignedToId ? String(raw.assignedToId) : undefined,
    assignedToName: raw?.assignedToName ? String(raw.assignedToName) : undefined,
    dueDate: raw?.dueDate ? String(raw.dueDate) : undefined,
    tags: safeArray<string>(raw?.tags).map((item) => String(item)),
    comments: safeArray<any>(raw?.comments).map((comment) => normalizeComment(comment)),
    activity: safeArray<any>(raw?.activity || raw?.workflow).map((item) => normalizeActivity(item, taskId)),
    createdAt: String(raw?.createdAt || raw?.createdOn || new Date().toISOString()),
    updatedAt: String(raw?.updatedAt || raw?.updatedOn || raw?.createdAt || new Date().toISOString()),
  } as Task;
};

const mapCreatePayload = (input: CreateTaskInput) => ({
  title: input.title,
  description: input.description,
  department: input.department,
  scope: input.scope,
  priority: input.priority,
  dueDate: input.dueDate,
  assignedToId: input.assignedToId,
  tags: input.tags || [],
  createdById: input.createdById,
});

const mapUpdatePayload = (input: UpdateTaskInput) => ({
  title: input.title,
  description: input.description,
  department: input.department,
  scope: input.scope,
  status: input.status,
  priority: input.priority,
  dueDate: input.dueDate,
  assignedToId: input.assignedToId,
  tags: input.tags,
  updatedByName: input.updatedByName,
});

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get<ApiResponse<unknown[]> | unknown[]>("/tasks");
    const payload = unwrapData<unknown[]>(response.data);
    return safeArray<any>(payload).map((item) => normalizeTask(item));
  },

  async getOverdueTasks(): Promise<Task[]> {
    const response = await api.get<ApiResponse<unknown[]> | unknown[]>("/tasks/overdue");
    const payload = unwrapData<unknown[]>(response.data);
    return safeArray<any>(payload).map((item) => normalizeTask(item));
  },

  async getTaskById(taskId: string): Promise<Task | null> {
    const response = await api.get<ApiResponse<unknown> | unknown>(`/tasks/${taskId}`);
    const payload = unwrapData<unknown>(response.data);
    return payload ? normalizeTask(payload) : null;
  },

  async getTaskByNumber(taskNumber: string): Promise<Task | null> {
    const response = await api.get<ApiResponse<unknown> | unknown>(`/tasks/number/${taskNumber}`);
    const payload = unwrapData<unknown>(response.data);
    return payload ? normalizeTask(payload) : null;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const response = await api.post<ApiResponse<unknown> | unknown>("/tasks", mapCreatePayload(input));
    return normalizeTask(unwrapData<unknown>(response.data));
  },

  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    const response = await api.put<ApiResponse<unknown> | unknown>(`/tasks/${taskId}`, mapUpdatePayload(input));
    return normalizeTask(unwrapData<unknown>(response.data));
  },

  async patchTask(taskId: string, input: Partial<UpdateTaskInput>): Promise<Task> {
    const response = await api.patch<ApiResponse<unknown> | unknown>(`/tasks/${taskId}`, mapUpdatePayload(input as UpdateTaskInput));
    return normalizeTask(unwrapData<unknown>(response.data));
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const response = await api.patch<ApiResponse<unknown> | unknown>(`/tasks/${taskId}/status`, { status });
    return normalizeTask(unwrapData<unknown>(response.data));
  },

  async assignTask(taskId: string, assignedToId?: string): Promise<Task> {
    const response = await api.patch<ApiResponse<unknown> | unknown>(`/tasks/${taskId}/assign`, {
      assignedToId,
    });
    return normalizeTask(unwrapData<unknown>(response.data));
  },

  async addComment(taskId: string, input: AddTaskCommentInput): Promise<TaskComment> {
    const response = await api.post<ApiResponse<unknown> | unknown>(`/tasks/${taskId}/comments`, {
      message: input.message,
      authorId: input.authorId,
      authorName: input.authorName,
    });
    return normalizeComment(unwrapData<unknown>(response.data));
  },

  async getWorkflow(taskId: string): Promise<TaskActivity[]> {
    const response = await api.get<ApiResponse<unknown[]> | unknown[]>(`/tasks/${taskId}/workflow`);
    const payload = unwrapData<unknown[]>(response.data);
    return safeArray<any>(payload).map((item) => normalizeActivity(item, taskId));
  },

  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },

  getAssignableOfficers(tasks: Task[], currentUser?: CurrentUser, department?: Department): TaskAssignee[] {
    const map = new Map<string, TaskAssignee>();

    tasks.forEach((task) => {
      if (task.assignedToId && task.assignedToName) {
        map.set(task.assignedToId, {
          id: task.assignedToId,
          name: task.assignedToName,
          department: task.department,
        });
      }
    });

    if (currentUser?.id && currentUser?.name) {
      map.set(currentUser.id, {
        id: currentUser.id,
        name: currentUser.name,
        department: currentUser.department || Department.UNASSIGNED,
      });
    }

    const officers = [...map.values()];
    return department ? officers.filter((officer) => officer.department === department) : officers;
  },
};
