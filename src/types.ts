export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate: string; // ISO string
  priority: 'Low' | 'Medium' | 'High';
  category: 'Work' | 'Personal' | 'Marketing' | 'Development' | 'Design';
  isCompleted: boolean;
  order: number;
  tags: string[];
  recurringInterval: 'none' | 'daily' | 'weekly' | 'monthly';
  assignee?: string;
  lastModified: number; // timestamp
}

export interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string; // HH:MM AM/PM or Date
  isTeammate: boolean;
  taskId?: string; // Opt association
}

export interface iOSNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'alert' | 'reminder' | 'sync' | 'team';
}

export interface SyncLog {
  id: string;
  timestamp: string;
  device: string;
  action: string;
  status: 'success' | 'pending' | 'offline';
}
