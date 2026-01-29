import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface CardMember {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Card {
  id?: string;
  list_id: string;
  title: string;
  description?: string;
  position: number;
  label_ids?: string[];
  member_ids?: string[];
  members?: CardMember[];
  created_at?: string;
  updated_at?: string;
}

@Injectable()
export class CardsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(listId?: string): Promise<Card[]> {
    let query = this.supabaseService
      .getAdminClient()
      .from('cards')
      .select('*')
      .order('position', { ascending: true });

    if (listId) {
      query = query.eq('list_id', listId);
    }

    const { data: cards, error } = await query;
    if (error) throw error;

    const cardIds = (cards as { id: string }[]).map((c) => c.id);

    // Fetch label_ids for all cards
    const { data: cardLabels } = await this.supabaseService
      .getAdminClient()
      .from('card_labels')
      .select('card_id, label_id')
      .in('card_id', cardIds);

    // Fetch card_members for all cards
    const { data: cardMembers } = await this.supabaseService
      .getAdminClient()
      .from('card_members')
      .select('card_id, user_id')
      .in('card_id', cardIds);

    // Get unique user IDs and fetch profiles
    const userIds = [
      ...new Set(
        (cardMembers as { card_id: string; user_id: string }[] | null)?.map(
          (cm) => cm.user_id,
        ) || [],
      ),
    ];
    let profiles: CardMember[] = [];
    if (userIds.length > 0) {
      const { data: profileData } = await this.supabaseService
        .getAdminClient()
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);
      profiles = (profileData as CardMember[]) || [];
    }

    // Map label_ids and members to each card
    return (cards as Card[]).map((card) => {
      const memberIds =
        (cardMembers as { card_id: string; user_id: string }[] | null)
          ?.filter((cm) => cm.card_id === card.id)
          .map((cm) => cm.user_id) || [];
      const members = profiles.filter((p) => memberIds.includes(p.id));

      return {
        ...card,
        label_ids:
          (cardLabels as { card_id: string; label_id: string }[] | null)
            ?.filter((cl) => cl.card_id === card.id)
            .map((cl) => cl.label_id) || [],
        member_ids: memberIds,
        members,
      };
    });
  }

  async findOne(id: string): Promise<Card> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Card with ID ${id} not found`);

    // Fetch label_ids
    const { data: cardLabels } = await this.supabaseService
      .getAdminClient()
      .from('card_labels')
      .select('label_id')
      .eq('card_id', id);

    // Fetch card_members with profiles
    const { data: cardMembers } = await this.supabaseService
      .getAdminClient()
      .from('card_members')
      .select('user_id')
      .eq('card_id', id);

    const memberIds =
      (cardMembers as { user_id: string }[] | null)?.map((cm) => cm.user_id) ||
      [];
    let members: CardMember[] = [];
    if (memberIds.length > 0) {
      const { data: profiles } = await this.supabaseService
        .getAdminClient()
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', memberIds);
      members = (profiles as CardMember[]) || [];
    }

    return {
      ...(data as Card),
      label_ids:
        (cardLabels as { label_id: string }[] | null)?.map(
          (cl) => cl.label_id,
        ) || [],
      member_ids: memberIds,
      members,
    };
  }

  async create(card: Card): Promise<Card> {
    const { label_ids, member_ids, ...cardData } = card;

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('cards')
      .insert(cardData)
      .select()
      .single();

    if (error) throw error;

    const cardId = (data as { id: string }).id;

    // Add labels if provided
    if (label_ids && label_ids.length > 0) {
      await this.supabaseService
        .getAdminClient()
        .from('card_labels')
        .insert(
          label_ids.map((labelId) => ({ card_id: cardId, label_id: labelId })),
        );
    }

    // Add members if provided
    if (member_ids && member_ids.length > 0) {
      await this.supabaseService
        .getAdminClient()
        .from('card_members')
        .insert(
          member_ids.map((userId) => ({ card_id: cardId, user_id: userId })),
        );
    }

    return {
      ...(data as Card),
      label_ids: label_ids || [],
      member_ids: member_ids || [],
    };
  }

  async update(id: string, card: Partial<Card>): Promise<Card> {
    const { label_ids, member_ids, ...cardData } = card;

    // Update card fields (excluding label_ids, member_ids, members)
    if (Object.keys(cardData).length > 0) {
      const { error } = await this.supabaseService
        .getAdminClient()
        .from('cards')
        .update(cardData)
        .eq('id', id);

      if (error) throw new NotFoundException(`Card with ID ${id} not found`);
    }

    // If label_ids provided, sync them
    if (label_ids !== undefined) {
      // Remove all existing labels
      await this.supabaseService
        .getAdminClient()
        .from('card_labels')
        .delete()
        .eq('card_id', id);

      // Add new labels
      if (label_ids.length > 0) {
        await this.supabaseService
          .getAdminClient()
          .from('card_labels')
          .insert(
            label_ids.map((labelId) => ({ card_id: id, label_id: labelId })),
          );
      }
    }

    // If member_ids provided, sync them
    if (member_ids !== undefined) {
      // Remove all existing members
      await this.supabaseService
        .getAdminClient()
        .from('card_members')
        .delete()
        .eq('card_id', id);

      // Add new members
      if (member_ids.length > 0) {
        await this.supabaseService
          .getAdminClient()
          .from('card_members')
          .insert(
            member_ids.map((userId) => ({ card_id: id, user_id: userId })),
          );
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // card_labels will be deleted automatically due to ON DELETE CASCADE
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async addLabel(cardId: string, labelId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('card_labels')
      .insert({ card_id: cardId, label_id: labelId });

    if (error && !error.message.includes('duplicate')) throw error;
  }

  async removeLabel(cardId: string, labelId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('card_labels')
      .delete()
      .eq('card_id', cardId)
      .eq('label_id', labelId);

    if (error) throw error;
  }

  async addMember(cardId: string, userId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('card_members')
      .insert({ card_id: cardId, user_id: userId });

    if (error && !error.message.includes('duplicate')) throw error;
  }

  async removeMember(cardId: string, userId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('card_members')
      .delete()
      .eq('card_id', cardId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
