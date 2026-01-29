import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface List {
  id?: string;
  board_id: string;
  title: string;
  position: number;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable()
export class ListsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(boardId?: string): Promise<List[]> {
    let query = this.supabaseService
      .getAdminClient()
      .from('lists')
      .select('*')
      .order('position', { ascending: true });

    if (boardId) {
      query = query.eq('board_id', boardId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as List[];
  }

  async findOne(id: string): Promise<List> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`List with ID ${id} not found`);
    return data as List;
  }

  async create(list: List): Promise<List> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('lists')
      .insert(list)
      .select()
      .single();

    if (error) throw error;
    return data as List;
  }

  async update(id: string, list: Partial<List>): Promise<List> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('lists')
      .update(list)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException(`List with ID ${id} not found`);
    return data as List;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('lists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
