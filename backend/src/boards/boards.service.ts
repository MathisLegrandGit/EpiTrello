import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Board {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
  last_opened_at?: string;
}

@Injectable()
export class BoardsService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get the appropriate Supabase client.
   *
   * IMPORTANT: For board operations, we use the admin client because:
   * 1. Supabase RLS typically only allows users to read boards they own
   * 2. Collaborators need to access boards they don't own
   * 3. Access control is handled at the application level via the collaborators system
   */
  private getClient() {
    // Always use admin client for board operations to handle collaborator access
    // The collaborator access control is handled at the application level
    return this.supabaseService.getAdminClient();
  }

  async findAll(userId?: string): Promise<Board[]> {
    let query = this.getClient()
      .from('boards')
      .select('*')
      .order('last_opened_at', { ascending: false, nullsFirst: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data as Board[];
  }

  async findOne(id: string): Promise<Board> {
    const { data, error } = await this.getClient()
      .from('boards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Board with ID ${id} not found`);

    // Update last_opened_at when board is accessed
    await this.updateLastOpened(id);

    return data as Board;
  }

  async updateLastOpened(id: string): Promise<void> {
    await this.getClient()
      .from('boards')
      .update({ last_opened_at: new Date().toISOString() })
      .eq('id', id);
  }

  async create(board: Board): Promise<Board> {
    const client = this.getClient();
    const { data, error } = await client
      .from('boards')
      .insert(board)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Create default columns for the new board
    const defaultLists = [
      { title: 'To Do', position: 0, color: '#3b82f6' },
      { title: 'In Progress', position: 1, color: '#f97316' },
      { title: 'Done', position: 2, color: '#22c55e' },
    ];

    const boardId = (data as { id: string }).id;
    for (const list of defaultLists) {
      await client.from('lists').insert({
        board_id: boardId,
        title: list.title,
        position: list.position,
        color: list.color,
      });
    }

    return data as Board;
  }

  async update(id: string, board: Partial<Board>): Promise<Board> {
    const { data, error } = await this.getClient()
      .from('boards')
      .update(board)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException(`Board with ID ${id} not found`);
    return data as Board;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.getClient()
      .from('boards')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  /**
   * Create a default board for new users
   */
  async createDefaultBoard(userId: string): Promise<Board> {
    // Check if user already has boards
    const existingBoards = await this.findAll(userId);
    if (existingBoards.length > 0) {
      return existingBoards[0];
    }

    // Color options matching frontend
    const colors = [
      '#8b5cf6',
      '#06b6d4',
      '#10b981',
      '#f43f5e',
      '#f59e0b',
      '#6366f1',
      '#d946ef',
      '#0ea5e9',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Create default board with random color
    const board = await this.create({
      user_id: userId,
      title: 'My First Board',
      description: 'Welcome to your first board!',
      color: randomColor,
    });

    // Create default lists for the board (already created by this.create method)
    // Note: the default lists are already created in the create method above

    return board;
  }
}
