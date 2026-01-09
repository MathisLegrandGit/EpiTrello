import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export interface FriendRequest {
    id: string;
    from_user_id: string;
    to_user_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    from_user?: UserProfile;
    to_user?: UserProfile;
}

export interface Friendship {
    id: string;
    user_id: string;
    friend_id: string;
    created_at: string;
    friend?: UserProfile;
}

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    data: Record<string, unknown>;
    read: boolean;
    created_at: string;
}

@Injectable()
export class FriendsService {
    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * Search for users by username, full_name, or email
     */
    async searchUsers(query: string, excludeUserId?: string): Promise<UserProfile[]> {
        const supabase = this.supabaseService.getClient();

        // Search profiles by username and full_name
        let queryBuilder = supabase
            .from('profiles')
            .select('id, username, email, full_name, avatar_url')
            .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
            .limit(10);

        if (excludeUserId) {
            queryBuilder = queryBuilder.neq('id', excludeUserId);
        }

        const { data, error } = await queryBuilder;

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }

    /**
     * Get user's friends list with profile info
     */
    async getFriends(userId: string): Promise<Friendship[]> {
        const supabase = this.supabaseService.getClient();

        // Get friendships where user is the user_id
        const { data, error } = await supabase
            .from('friendships')
            .select('id, user_id, friend_id, created_at')
            .eq('user_id', userId);

        if (error) {
            throw new Error(error.message);
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Get friend profiles
        const friendIds = data.map(f => f.friend_id);
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, email, full_name, avatar_url')
            .in('id', friendIds);

        if (profileError) {
            throw new Error(profileError.message);
        }

        // Map profiles to friendships
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        return data.map(friendship => ({
            ...friendship,
            friend: profileMap.get(friendship.friend_id),
        }));
    }

    /**
     * Send a friend request
     */
    async sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
        const supabase = this.supabaseService.getClient();

        // Check if already friends
        const { data: existingFriendship } = await supabase
            .from('friendships')
            .select('id')
            .eq('user_id', fromUserId)
            .eq('friend_id', toUserId)
            .single();

        if (existingFriendship) {
            throw new ConflictException('Already friends with this user');
        }

        // Check if request already exists
        const { data: existingRequest } = await supabase
            .from('friend_requests')
            .select('id, status')
            .eq('from_user_id', fromUserId)
            .eq('to_user_id', toUserId)
            .single();

        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                throw new ConflictException('Friend request already sent');
            }
            // Delete old completed request so we can create a new one
            await supabase
                .from('friend_requests')
                .delete()
                .eq('id', existingRequest.id);
        }

        // Also check for old request in reverse direction
        const { data: oldReverseRequest } = await supabase
            .from('friend_requests')
            .select('id, status')
            .eq('from_user_id', toUserId)
            .eq('to_user_id', fromUserId)
            .neq('status', 'pending')
            .single();

        if (oldReverseRequest) {
            // Delete old completed reverse request
            await supabase
                .from('friend_requests')
                .delete()
                .eq('id', oldReverseRequest.id);
        }

        // Check if there's a pending request from the other user
        const { data: reverseRequest } = await supabase
            .from('friend_requests')
            .select('id')
            .eq('from_user_id', toUserId)
            .eq('to_user_id', fromUserId)
            .eq('status', 'pending')
            .single();

        if (reverseRequest) {
            // Auto-accept if they already sent us a request
            await this.respondToFriendRequest(reverseRequest.id, 'accepted');
            throw new ConflictException('Pending request from this user exists - automatically accepted');
        }

        // Create the friend request
        const { data, error } = await supabase
            .from('friend_requests')
            .insert({
                from_user_id: fromUserId,
                to_user_id: toUserId,
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        // Create notification for recipient
        await supabase.from('notifications').insert({
            user_id: toUserId,
            type: 'friend_request',
            data: {
                request_id: data.id,
                from_user_id: fromUserId,
            },
        });

        return data;
    }

    /**
     * Get pending friend requests for a user (incoming)
     */
    async getPendingRequests(userId: string): Promise<FriendRequest[]> {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase
            .from('friend_requests')
            .select('id, from_user_id, to_user_id, status, created_at')
            .eq('to_user_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Get sender profiles
        const senderIds = data.map(r => r.from_user_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, email, full_name, avatar_url')
            .in('id', senderIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        return data.map(request => ({
            ...request,
            from_user: profileMap.get(request.from_user_id),
        }));
    }

    /**
     * Get sent friend requests for a user (outgoing)
     */
    async getSentRequests(userId: string): Promise<FriendRequest[]> {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase
            .from('friend_requests')
            .select('id, from_user_id, to_user_id, status, created_at')
            .eq('from_user_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Get recipient profiles
        const recipientIds = data.map(r => r.to_user_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, email, full_name, avatar_url')
            .in('id', recipientIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        return data.map(request => ({
            ...request,
            to_user: profileMap.get(request.to_user_id),
        }));
    }

    /**
     * Respond to a friend request (accept/reject)
     */
    async respondToFriendRequest(
        requestId: string,
        status: 'accepted' | 'rejected',
    ): Promise<FriendRequest> {
        const supabase = this.supabaseService.getClient();

        // Get the request
        const { data: request, error: fetchError } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError || !request) {
            throw new NotFoundException('Friend request not found');
        }

        if (request.status !== 'pending') {
            throw new ConflictException('Request already processed');
        }

        if (status === 'accepted') {
            // Use the database function to handle acceptance
            const { error: acceptError } = await supabase.rpc('accept_friend_request', {
                request_id: requestId,
            });

            if (acceptError) {
                throw new Error(acceptError.message);
            }
        } else {
            // Just update status to rejected
            const { error: updateError } = await supabase
                .from('friend_requests')
                .update({ status: 'rejected', updated_at: new Date().toISOString() })
                .eq('id', requestId);

            if (updateError) {
                throw new Error(updateError.message);
            }

            // Create notification for requester
            await supabase.from('notifications').insert({
                user_id: request.from_user_id,
                type: 'friend_rejected',
                data: {
                    request_id: requestId,
                    friend_id: request.to_user_id,
                },
            });
        }

        // Return updated request
        const { data: updated } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        return updated;
    }

    /**
     * Remove a friend
     */
    async removeFriend(userId: string, friendId: string): Promise<void> {
        const supabase = this.supabaseService.getClient();

        // Delete both directions of the friendship
        const { error: error1 } = await supabase
            .from('friendships')
            .delete()
            .eq('user_id', userId)
            .eq('friend_id', friendId);

        const { error: error2 } = await supabase
            .from('friendships')
            .delete()
            .eq('user_id', friendId)
            .eq('friend_id', userId);

        if (error1 || error2) {
            throw new Error('Failed to remove friend');
        }
    }

    /**
     * Get user's notifications
     */
    async getNotifications(userId: string): Promise<Notification[]> {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: string): Promise<number> {
        const supabase = this.supabaseService.getClient();

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) {
            throw new Error(error.message);
        }

        return count || 0;
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(notificationId: string): Promise<Notification> {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)
            .select()
            .single();

        if (error) {
            throw new NotFoundException('Notification not found');
        }

        return data;
    }

    /**
     * Mark all notifications as read
     */
    async markAllNotificationsRead(userId: string): Promise<void> {
        const supabase = this.supabaseService.getClient();

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string): Promise<void> {
        const supabase = this.supabaseService.getClient();

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) {
            throw new Error(error.message);
        }
    }
}
