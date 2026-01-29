import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

/**
 * SupabaseService provides Supabase clients for different use cases.
 *
 * IMPORTANT: This service is a singleton but provides STATELESS client access.
 * - Use getClient() for anonymous/public operations (no user context)
 * - Use getClientForUser(accessToken) for user-specific operations (uses their JWT)
 * - Use getAdminClient() for service-role operations (bypasses RLS)
 *
 * NEVER cache user-specific data or auth state in this service or any service
 * that depends on it. Each request must be treated independently.
 */
@Injectable()
export class SupabaseService {
  private supabaseUrl: string;
  private supabaseKey: string;
  private supabaseAdmin: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined in .env');
    }

    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;

    if (supabaseServiceKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      console.log('Supabase Admin Client initialized');
    } else {
      console.warn(
        'SUPABASE_SERVICE_ROLE_KEY not found - falling back to anon client for admin operations',
      );
    }
  }

  /**
   * Get a fresh Supabase client for anonymous/public operations.
   * This client has no user session attached.
   * Use this for operations that don't require user authentication context.
   */
  getClient(): SupabaseClient {
    // Return a fresh client instance to avoid session state pollution
    return createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  /**
   * Get a Supabase client configured with the user's access token.
   * This should be used for all user-specific operations to ensure
   * proper RLS (Row Level Security) enforcement.
   *
   * @param accessToken - The JWT access token from the Authorization header
   * @returns A Supabase client configured with the user's auth context
   */
  getClientForUser(accessToken: string): SupabaseClient {
    return createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  /**
   * Get the admin client with service role permissions.
   * This client bypasses RLS and should only be used for
   * administrative operations that require elevated privileges.
   */
  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin || this.getClient();
  }
}
