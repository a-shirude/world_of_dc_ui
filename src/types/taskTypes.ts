import { Department } from "../constants/enums";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "OPEN" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "CANCELLED";
export type TaskScope = "SELF" | "DEPARTMENT";

export interface TaskComment {
  id: string;
  taskId: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  action: string;
  actorName: string;
  createdAt: string;
}

export interface Task {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  department: Department;
  scope: TaskScope;
  status: TaskStatus;
  priority: TaskPriority;
  createdById: string;
  createdByName: string;
  assignedToId?: string;
  assignedToName?: string;
  dueDate?: string;
  tags: string[];
  comments: TaskComment[];
  activity: TaskActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  department: Department;
  scope: TaskScope;
  priority: TaskPriority;
  dueDate?: string;
  assignedToId?: string;
  assignedToName?: string;
  tags?: string[];
  createdById: string;
  createdByName: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  department?: Department;
  scope?: TaskScope;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedToId?: string;
  assignedToName?: string;
  tags?: string[];
  updatedByName: string;
}

export interface AddTaskCommentInput {
  text: string;
  authorId: string;
  authorName: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
  department: Department;
}
