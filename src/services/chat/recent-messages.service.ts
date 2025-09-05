// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

export interface RecentMessage {
  id: string;
  senderName: string;
  senderId: string;
  content: string;
  createdAt: string;
  avatar?: string;
  isUnread: boolean;
}

export const recentMessagesService = {
  async getRecentMessages(userId: string, limit: number = 10): Promise<RecentMessage[]> {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          content,
          created_at,
          is_read,
          sender_id,
          sender:profiles!sender_id(id, name, avatar)
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(msg => ({
        id: msg.id,
        senderName: (msg.sender as any)?.name || 'Unknown User',
        senderId: msg.sender_id,
        content: msg.content,
        createdAt: msg.created_at,
        avatar: (msg.sender as any)?.avatar || '/placeholder.svg',
        isUnread: !msg.is_read
      }));
    } catch (error: any) {
      console.error('Error fetching recent messages:', error);
      return [];
    }
  },

  formatTimeAgo(dateString: string): string {
    const now = new Date();
    const messageTime = new Date(dateString);
    const diffInMs = now.getTime() - messageTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
};