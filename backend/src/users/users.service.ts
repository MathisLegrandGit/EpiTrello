import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Search for users by username or full_name
   */
  async searchUsers(
    query: string,
    excludeUserId?: string,
  ): Promise<UserProfile[]> {
    const supabase = this.supabaseService.getAdminClient();

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
   * Get a single user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, full_name, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }
}
