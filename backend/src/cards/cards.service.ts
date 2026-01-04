import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Card {
  id?: string;
  list_id: string;
  title: string;
  description?: string;
  position: number;
  label_id?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable()
export class CardsService {
  constructor(private supabaseService: SupabaseService) { }

  async findAll(listId?: string): Promise<Card[]> {
    let query = this.supabaseService
      .getClient()
      .from('cards')
      .select('*')
      .order('position', { ascending: true });

    if (listId) {
      query = query.eq('list_id', listId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findOne(id: string): Promise<Card> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Card with ID ${id} not found`);
    return data;
  }

  async create(card: Card): Promise<Card> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('cards')
      .insert(card)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, card: Partial<Card>): Promise<Card> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('cards')
      .update(card)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException(`Card with ID ${id} not found`);
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
