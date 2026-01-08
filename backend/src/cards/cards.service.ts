import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Card {
  id?: string;
  list_id: string;
  title: string;
  description?: string;
  position: number;
  label_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

@Injectable()
export class CardsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(listId?: string): Promise<Card[]> {
    let query = this.supabaseService
      .getClient()
      .from('cards')
      .select('*')
      .order('position', { ascending: true });

    if (listId) {
      query = query.eq('list_id', listId);
    }

    const { data: cards, error } = await query;
    if (error) throw error;

    // Fetch label_ids for all cards
    const cardIds = cards.map((c) => c.id);
    const { data: cardLabels } = await this.supabaseService
      .getClient()
      .from('card_labels')
      .select('card_id, label_id')
      .in('card_id', cardIds);

    // Map label_ids to each card
    return cards.map((card) => ({
      ...card,
      label_ids:
        cardLabels
          ?.filter((cl) => cl.card_id === card.id)
          .map((cl) => cl.label_id) || [],
    }));
  }

  async findOne(id: string): Promise<Card> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Card with ID ${id} not found`);

    // Fetch label_ids
    const { data: cardLabels } = await this.supabaseService
      .getClient()
      .from('card_labels')
      .select('label_id')
      .eq('card_id', id);

    return {
      ...data,
      label_ids: cardLabels?.map((cl) => cl.label_id) || [],
    };
  }

  async create(card: Card): Promise<Card> {
    const { label_ids, ...cardData } = card;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('cards')
      .insert(cardData)
      .select()
      .single();

    if (error) throw error;

    // Add labels if provided
    if (label_ids && label_ids.length > 0) {
      await this.supabaseService
        .getClient()
        .from('card_labels')
        .insert(
          label_ids.map((labelId) => ({ card_id: data.id, label_id: labelId })),
        );
    }

    return { ...data, label_ids: label_ids || [] };
  }

  async update(id: string, card: Partial<Card>): Promise<Card> {
    const { label_ids, ...cardData } = card;

    // Update card fields (excluding label_ids)
    if (Object.keys(cardData).length > 0) {
      const { error } = await this.supabaseService
        .getClient()
        .from('cards')
        .update(cardData)
        .eq('id', id);

      if (error) throw new NotFoundException(`Card with ID ${id} not found`);
    }

    // If label_ids provided, sync them
    if (label_ids !== undefined) {
      // Remove all existing labels
      await this.supabaseService
        .getClient()
        .from('card_labels')
        .delete()
        .eq('card_id', id);

      // Add new labels
      if (label_ids.length > 0) {
        await this.supabaseService
          .getClient()
          .from('card_labels')
          .insert(
            label_ids.map((labelId) => ({ card_id: id, label_id: labelId })),
          );
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // card_labels will be deleted automatically due to ON DELETE CASCADE
    const { error } = await this.supabaseService
      .getClient()
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async addLabel(cardId: string, labelId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('card_labels')
      .insert({ card_id: cardId, label_id: labelId });

    if (error && !error.message.includes('duplicate')) throw error;
  }

  async removeLabel(cardId: string, labelId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('card_labels')
      .delete()
      .eq('card_id', cardId)
      .eq('label_id', labelId);

    if (error) throw error;
  }
}
