import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Label {
  id?: string;
  board_id: string;
  name: string;
  color: string;
  created_at?: string;
}

@Injectable()
export class LabelsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(boardId?: string): Promise<Label[]> {
    let query = this.supabaseService
      .getAdminClient()
      .from('labels')
      .select('*')
      .order('name', { ascending: true });

    if (boardId) {
      query = query.eq('board_id', boardId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Label[];
  }

  async findOne(id: string): Promise<Label> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('labels')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Label with ID ${id} not found`);
    return data as Label;
  }

  async create(label: Label): Promise<Label> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('labels')
      .insert(label)
      .select()
      .single();

    if (error) throw error;
    return data as Label;
  }

  async update(id: string, label: Partial<Label>): Promise<Label> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('labels')
      .update(label)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException(`Label with ID ${id} not found`);
    return data as Label;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('labels')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
