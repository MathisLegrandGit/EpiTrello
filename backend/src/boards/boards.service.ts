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
  constructor(private supabaseService: SupabaseService) { }

  async findAll(userId?: string): Promise<Board[]> {
    let query = this.supabaseService
      .getClient()
      .from('boards')
      .select('*')
      .order('last_opened_at', { ascending: false, nullsFirst: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async findOne(id: string): Promise<Board> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('boards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Board with ID ${id} not found`);

    // Update last_opened_at when board is accessed
    await this.updateLastOpened(id);

    return data;
  }

  async updateLastOpened(id: string): Promise<void> {
    await this.supabaseService
      .getClient()
      .from('boards')
      .update({ last_opened_at: new Date().toISOString() })
      .eq('id', id);
  }

  async create(board: Board): Promise<Board> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('boards')
      .insert(board)
      .select()
      .single();

    if (error) throw error;

    // Create default columns for the new board
    const defaultLists = [
      { title: 'To Do', position: 0, color: '#3b82f6' },
      { title: 'In Progress', position: 1, color: '#f97316' },
      { title: 'Done', position: 2, color: '#22c55e' }
    ];

    for (const list of defaultLists) {
      await this.supabaseService
        .getClient()
        .from('lists')
        .insert({
          board_id: data.id,
          title: list.title,
          position: list.position,
          color: list.color,
        });
    }

    return data;
  }

  async update(id: string, board: Partial<Board>): Promise<Board> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('boards')
      .update(board)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException(`Board with ID ${id} not found`);
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('boards')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#6366f1', '#d946ef', '#0ea5e9'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Create default board with random color
    const board = await this.create({
      user_id: userId,
      title: 'My First Board',
      description: 'Welcome to your first board!',
      color: randomColor,
    });

    // Create default lists for the board
    const defaultLists = ['To Do', 'In Progress', 'Done'];
    for (let i = 0; i < defaultLists.length; i++) {
      await this.supabaseService
        .getClient()
        .from('lists')
        .insert({
          board_id: board.id,
          title: defaultLists[i],
          position: i,
        });
    }

    return board;
  }
}
