// Core type definitions for ClearQ

export type UserRole = "CLIENT" | "AGENT" | "SUPERVISOR" | "ADMIN";
export type TicketStatus = "OPEN" | "PENDING" | "ON_HOLD" | "SOLVED" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketType = "QUESTION" | "INCIDENT" | "PROBLEM" | "TASK" | "FEATURE_REQUEST";
export type Channel = "EMAIL" | "WEB" | "CHAT" | "PHONE" | "API" | "SOCIAL";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  department: string | null;
  phone: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface Ticket {
  id: string;
  number: number;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  type: TicketType;
  channel: Channel;
  creatorId: string;
  assigneeId: string | null;
  teamId: string | null;
  organizationId: string | null;
  dueAt: Date | null;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  creator?: User;
  assignee?: User | null;
  comments?: Comment[];
  tags?: Tag[];
}

export interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  ticketId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description: string | null;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  color: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface Toast {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  duration?: number;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  solvedToday: number;
  avgResponseTime: number;
  satisfactionScore: number;
  ticketsByPriority: Record<Priority, number>;
  ticketsByStatus: Record<TicketStatus, number>;
  recentActivity: ActivityItem[];
  ticketTrend: TrendData[];
}

export interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  ticketId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  user?: User;
  ticket?: Ticket;
}

export interface TrendData {
  date: string;
  created: number;
  resolved: number;
}

export interface TicketFilters {
  status?: TicketStatus[];
  priority?: Priority[];
  type?: TicketType[];
  assigneeId?: string;
  teamId?: string;
  tags?: string[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}



