export interface AppNotification {
  id: number;
  message: string;
  type: 'cancellation' | 'reminder' | 'urgent' | 'broadcast';
  timestamp: string;
  read: boolean;
  recipientUsername?: string;
}
