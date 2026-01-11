import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface BoardCollaborator {
    id: string;
    board_id: string;
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    status: 'pending' | 'accepted';
    invited_by?: string;
    created_at: string;
    user?: {
        id: string;
        username: string;
        full_name?: string;
        avatar_url?: string;
    };
}

export interface SharedBoard {
    id: string;
    title: string;
    description?: string;
    color?: string;
    created_at: string;
    last_opened_at?: string;
    owner?: {
        id: string;
        username: string;
        full_name?: string;
        avatar_url?: string;
    };
    role: string;
    status: 'pending' | 'accepted';
}

@Injectable()
export class CollaboratorsService {
    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * Get all collaborators for a board
     */
    async getCollaborators(boardId: string): Promise<BoardCollaborator[]> {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase
            .from('board_collaborators')
            .select('id, board_id, user_id, role, status, invited_by, created_at')
            .eq('board_id', boardId);

        if (error) throw error;

        // Fetch user profiles for each collaborator
        const collaborators: BoardCollaborator[] = [];
        for (const collab of data || []) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .eq('id', collab.user_id)
                .single();

            collaborators.push({
                ...collab,
                user: profile || undefined,
            });
        }

        return collaborators;
    }

    /**
     * Add a collaborator to a board
     */
    async addCollaborator(
        boardId: string,
        userId: string,
        invitedBy: string,
        role: string = 'editor',
    ): Promise<BoardCollaborator> {
        const supabase = this.supabaseService.getClient();

        // Check if board exists and inviter is the owner
        const { data: board, error: boardError } = await supabase
            .from('boards')
            .select('id, user_id, title')
            .eq('id', boardId)
            .single();

        if (boardError || !board) {
            throw new NotFoundException('Board not found');
        }

        if (board.user_id !== invitedBy) {
            throw new ForbiddenException('Only the board owner can add collaborators');
        }

        // Check if user is already a collaborator
        const { data: existing } = await supabase
            .from('board_collaborators')
            .select('id')
            .eq('board_id', boardId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            throw new ConflictException('User is already a collaborator on this board');
        }

        // Add collaborator
        const { data, error } = await supabase
            .from('board_collaborators')
            .insert({
                board_id: boardId,
                user_id: userId,
                role,
                status: 'pending',
                invited_by: invitedBy,
            })
            .select()
            .single();

        if (error) throw error;

        // Get inviter's profile for notification
        const { data: inviterProfile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', invitedBy)
            .single();

        // Create notification for the added user
        // Create notification for the added user
        const adminSupabase = this.supabaseService.getAdminClient();
        const { error: notifError } = await adminSupabase.from('notifications').insert({
            user_id: userId,
            type: 'board_invite',
            data: {
                board_id: boardId,
                board_title: board.title,
                invited_by: invitedBy,
                inviter_name: inviterProfile?.full_name || inviterProfile?.username || 'Someone',
            },
            read: false,
        });

        if (notifError) {
            console.error('Failed to create board_invite notification:', notifError);
        }

        return data;
    }

    /**
     * Remove a collaborator from a board
     */
    async removeCollaborator(
        boardId: string,
        userId: string,
        requesterId: string,
    ): Promise<void> {
        const supabase = this.supabaseService.getClient();

        // Check if board exists
        const { data: board, error: boardError } = await supabase
            .from('boards')
            .select('id, user_id, title')
            .eq('id', boardId)
            .single();

        if (boardError || !board) {
            throw new NotFoundException('Board not found');
        }

        // Only owner or the collaborator themselves can remove
        if (board.user_id !== requesterId && userId !== requesterId) {
            throw new ForbiddenException('Not authorized to remove this collaborator');
        }

        const { error } = await supabase
            .from('board_collaborators')
            .delete()
            .eq('board_id', boardId)
            .eq('user_id', userId);

        if (error) throw error;

        // Create notification for removed user (if removed by owner)
        if (userId !== requesterId) {
            const { data: ownerProfile } = await supabase
                .from('profiles')
                .select('username, full_name')
                .eq('id', requesterId)
                .single();

            const adminSupabase = this.supabaseService.getAdminClient();
            await adminSupabase.from('notifications').insert({
                user_id: userId,
                type: 'board_removed',
                data: {
                    board_id: boardId,
                    board_title: board.title,
                    removed_by: requesterId,
                    remover_name: ownerProfile?.full_name || ownerProfile?.username || 'Board owner',
                },
                read: false,
            });
        }
    }

    /**
     * Respond to an invitation (accept or decline)
     */
    async respondToInvitation(
        boardId: string,
        userId: string,
        accept: boolean,
    ): Promise<void> {
        const supabase = this.supabaseService.getClient();

        if (accept) {
            // Accept: Update status to 'accepted'
            const { error } = await supabase
                .from('board_collaborators')
                .update({ status: 'accepted' })
                .eq('board_id', boardId)
                .eq('user_id', userId);

            if (error) throw error;
        } else {
            // Decline: Delete the record
            const { error } = await supabase
                .from('board_collaborators')
                .delete()
                .eq('board_id', boardId)
                .eq('user_id', userId);

            if (error) throw error;
        }
    }

    /**
     * Update a collaborator's role
     */
    async updateCollaboratorRole(
        boardId: string,
        userId: string,
        role: string,
        requesterId: string,
    ): Promise<void> {
        const supabase = this.supabaseService.getClient();

        // Check if board exists and requester is the owner
        const { data: board, error: boardError } = await supabase
            .from('boards')
            .select('id, user_id')
            .eq('id', boardId)
            .single();

        if (boardError || !board) {
            throw new NotFoundException('Board not found');
        }

        if (board.user_id !== requesterId) {
            throw new ForbiddenException('Only the board owner can change collaborator roles');
        }

        // Update the role
        const { error } = await supabase
            .from('board_collaborators')
            .update({ role })
            .eq('board_id', boardId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    /**
     * Get boards shared with a user
     */
    async getSharedBoards(userId: string): Promise<SharedBoard[]> {
        const supabase = this.supabaseService.getClient();

        // Get all board_collaborator entries for this user
        const { data: collabs, error: collabError } = await supabase
            .from('board_collaborators')
            .select('board_id, role, status')
            .eq('user_id', userId);

        if (collabError) throw collabError;
        if (!collabs || collabs.length === 0) return [];

        // Get the actual boards
        const boardIds = collabs.map((c) => c.board_id);
        const { data: boards, error: boardsError } = await supabase
            .from('boards')
            .select('id, title, description, color, created_at, last_opened_at, user_id')
            .in('id', boardIds)
            .order('last_opened_at', { ascending: false, nullsFirst: false });

        if (boardsError) throw boardsError;

        // Get owner profiles
        const sharedBoards: SharedBoard[] = [];
        for (const board of boards || []) {
            const { data: ownerProfile } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .eq('id', board.user_id)
                .single();

            const collab = collabs.find((c) => c.board_id === board.id);

            sharedBoards.push({
                id: board.id,
                title: board.title,
                description: board.description,
                color: board.color,
                created_at: board.created_at,
                last_opened_at: board.last_opened_at,
                owner: ownerProfile || undefined,
                role: collab?.role || 'editor',
                status: collab?.status || 'accepted',
            });
        }

        return sharedBoards;
    }

    /**
     * Check if a user has access to a board (owner or collaborator)
     */
    async hasAccess(boardId: string, userId: string): Promise<boolean> {
        const supabase = this.supabaseService.getClient();

        // Check if owner
        const { data: board } = await supabase
            .from('boards')
            .select('user_id')
            .eq('id', boardId)
            .single();

        if (board?.user_id === userId) return true;

        // Check if collaborator
        const { data: collab } = await supabase
            .from('board_collaborators')
            .select('id')
            .eq('board_id', boardId)
            .eq('user_id', userId)
            .single();

        return !!collab;
    }
}
