import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Notification {
  id: string;
  user_id: string;
  type: 'board_invite' | 'board_removed';
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

@Injectable()
export class NotificationsService {
  constructor(private supabase: SupabaseService) {}

  private getClient() {
    return this.supabase.getAdminClient();
  }

  async getAll(userId: string): Promise<Notification[]> {
    const { data, error } = await this.getClient()
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Notification[]) || [];
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const { count, error } = await this.getClient()
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { count: count || 0 };
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await this.getClient()
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (response.error) throw response.error;
    return response.data as Notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.getClient()
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  async delete(notificationId: string): Promise<void> {
    const { error } = await this.getClient()
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  async create(
    notification: Omit<Notification, 'id' | 'created_at'>,
  ): Promise<Notification> {
    const response = await this.getClient()
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (response.error) throw response.error;
    return response.data as Notification;
  }
}
