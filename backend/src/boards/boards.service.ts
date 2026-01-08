import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Board {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable()
export class BoardsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(userId?: string): Promise<Board[]> {
    let query = this.supabaseService
      .getClient()
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false });

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
    return data;
  }

  async create(board: Board): Promise<Board> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('boards')
      .insert(board)
      .select()
      .single();

    if (error) throw error;
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
}
