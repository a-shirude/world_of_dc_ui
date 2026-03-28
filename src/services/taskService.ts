import { Department } from "../constants/enums";
import {
  AddTaskCommentInput,
  CreateTaskInput,
  Task,
  TaskAssignee,
  TaskComment,
  UpdateTaskInput,
} from "../types/taskTypes";

const DEBOUNCE_DELAY = 220;

const assignableOfficers: TaskAssignee[] = [
  { id: "off-101", name: "Neha Sharma", department: Department.HEALTH_DEPARTMENT },
  { id: "off-102", name: "Ravi Singh", department: Department.PUBLIC_WORKS_DEPARTMENT },
  { id: "off-103", name: "Anjali Das", department: Department.REVENUE_DEPARTMENT },
  { id: "off-104", name: "Vikas Rao", department: Department.EDUCATION_DEPARTMENT },
  { id: "off-105", name: "Amit Thakur", department: Department.POLICE_DEPARTMENT },
];

const now = new Date();
const oneDay = 24 * 60 * 60 * 1000;

const mkDate = (offsetDays: number): string => new Date(now.getTime() + offsetDays * oneDay).toISOString();

let tasksDb: Task[] = [
  {
    id: "task-1",
    taskNumber: "TSK-24001",
    title: "Verify medicine stock report",
    description: "Cross-check primary health center stock report with district register and submit variance report.",
    department: Department.HEALTH_DEPARTMENT,
    scope: "DEPARTMENT",
    status: "IN_PROGRESS",
    priority: "HIGH",
    createdById: "off-100",
    createdByName: "District Control",
    assignedToId: "off-101",
    assignedToName: "Neha Sharma",
    dueDate: mkDate(1),
    tags: ["inventory", "audit"],
    comments: [],
    activity: [],
    createdAt: mkDate(-2),
    updatedAt: mkDate(-1),
  },
  {
    id: "task-2",
    taskNumber: "TSK-24002",
    title: "Road pothole inspection",
    description: "Inspect ward 7 and ward 8 roads and upload geo-tagged observations.",
    department: Department.PUBLIC_WORKS_DEPARTMENT,
    scope: "SELF",
    status: "OPEN",
    priority: "MEDIUM",
    createdById: "off-102",
    createdByName: "Ravi Singh",
    assignedToId: "off-102",
    assignedToName: "Ravi Singh",
    dueDate: mkDate(3),
    tags: ["field", "roads"],
    comments: [],
    activity: [],
    createdAt: mkDate(-1),
    updatedAt: mkDate(-1),
  },
  {
    id: "task-3",
    taskNumber: "TSK-24003",
    title: "Revenue camp prep",
    description: "Prepare list of pending mutation cases before Saturday camp.",
    department: Department.REVENUE_DEPARTMENT,
    scope: "DEPARTMENT",
    status: "BLOCKED",
    priority: "URGENT",
    createdById: "off-103",
    createdByName: "Anjali Das",
    assignedToId: "off-103",
    assignedToName: "Anjali Das",
    dueDate: mkDate(0),
    tags: ["camp", "mutation"],
    comments: [],
    activity: [],
    createdAt: mkDate(-4),
    updatedAt: mkDate(-1),
  },
];

const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data)) as T;

const wait = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_DELAY));
};

const nextTaskNumber = (): string => {
  const base = 24000 + tasksDb.length + 1;
  return `TSK-${base}`;
};

const nextId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const taskService = {
  async getTasks(): Promise<Task[]> {
    await wait();
    return clone(tasksDb).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async getTaskById(taskId: string): Promise<Task | null> {
    await wait();
    const found = tasksDb.find((task) => task.id === taskId);
    return found ? clone(found) : null;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    await wait();

    const createdAt = new Date().toISOString();

    const newTask: Task = {
      id: nextId("task"),
      taskNumber: nextTaskNumber(),
      title: input.title,
      description: input.description,
      department: input.department,
      scope: input.scope,
      status: "OPEN",
      priority: input.priority,
      createdById: input.createdById,
      createdByName: input.createdByName,
      assignedToId: input.scope === "SELF" ? input.assignedToId || input.createdById : input.assignedToId,
      assignedToName: input.scope === "SELF" ? input.assignedToName || input.createdByName : input.assignedToName,
      dueDate: input.dueDate,
      tags: input.tags || [],
      comments: [],
      activity: [
        {
          id: nextId("activity"),
          taskId: "",
          action: "Task created",
          actorName: input.createdByName,
          createdAt,
        },
      ],
      createdAt,
      updatedAt: createdAt,
    };

    newTask.activity[0].taskId = newTask.id;
    tasksDb = [newTask, ...tasksDb];
    return clone(newTask);
  },

  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    await wait();

    const index = tasksDb.findIndex((task) => task.id === taskId);
    if (index === -1) {
      throw new Error("Task not found");
    }

    const existing = tasksDb[index];
    const updatedAt = new Date().toISOString();

    const updatedTask: Task = {
      ...existing,
      ...input,
      updatedAt,
      activity: [
        {
          id: nextId("activity"),
          taskId,
          action: "Task updated",
          actorName: input.updatedByName,
          createdAt: updatedAt,
        },
        ...existing.activity,
      ],
    };

    tasksDb[index] = updatedTask;
    return clone(updatedTask);
  },

  async addComment(taskId: string, input: AddTaskCommentInput): Promise<TaskComment> {
    await wait();

    const index = tasksDb.findIndex((task) => task.id === taskId);
    if (index === -1) {
      throw new Error("Task not found");
    }

    const comment: TaskComment = {
      id: nextId("comment"),
      taskId,
      text: input.text,
      authorId: input.authorId,
      authorName: input.authorName,
      createdAt: new Date().toISOString(),
    };

    tasksDb[index] = {
      ...tasksDb[index],
      comments: [comment, ...tasksDb[index].comments],
      activity: [
        {
          id: nextId("activity"),
          taskId,
          action: "Comment added",
          actorName: input.authorName,
          createdAt: comment.createdAt,
        },
        ...tasksDb[index].activity,
      ],
      updatedAt: comment.createdAt,
    };

    return clone(comment);
  },

  async getAssignableOfficers(department?: Department): Promise<TaskAssignee[]> {
    await wait();
    const list = department
      ? assignableOfficers.filter((officer) => officer.department === department)
      : assignableOfficers;
    return clone(list);
  },
};
