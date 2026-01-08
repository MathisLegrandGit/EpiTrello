import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async signUp(signUpDto: SignUpDto) {
    const { email, password, username } = signUpDto;

    const { data, error } = await this.supabaseService.getClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      throw new ConflictException(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;
    let email = identifier;

    // Check if identifier looks like an email using simple regex
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!isEmail) {
      // Look up email by username
      const { data, error } = await this.supabaseService
        .getClient()
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single();

      if (error || !data) {
        throw new UnauthorizedException('Invalid login credentials');
      }
      email = data.email;
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    // Fetch profile data from profiles table and merge into user
    const { data: profile } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', data.user.id)
      .single();

    // Merge profile data into user_metadata
    const enrichedUser = {
      ...data.user,
      user_metadata: {
        ...data.user.user_metadata,
        ...(profile && {
          username: profile.username || data.user.user_metadata?.username,
          full_name: profile.full_name || data.user.user_metadata?.full_name,
          avatar_url: profile.avatar_url || data.user.user_metadata?.avatar_url,
        }),
      },
    };

    return {
      user: enrichedUser,
      session: data.session,
    };
  }

  async logout(accessToken: string) {
    const { error } = await this.supabaseService.getClient().auth.signOut();

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { message: 'Logged out successfully' };
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const { username, fullName, avatarUrl } = updateProfileDto;

    // Get existing profile to preserve data
    const { data: existingProfile } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', id)
      .single();

    // Upsert profiles table (create if doesn't exist, update if it does)
    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .upsert(
        {
          id,
          username: username ?? existingProfile?.username,
          full_name: fullName ?? existingProfile?.full_name,
          avatar_url: avatarUrl ?? existingProfile?.avatar_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .select()
      .single();

    if (error) {
      throw new ConflictException(error.message);
    }

    return data;
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    // Note: Password updates require the user's session token on the frontend
    // Use supabase.auth.updateUser({ password: newPassword }) on the client side
    // This backend endpoint is a placeholder for future implementation
    throw new UnauthorizedException('Password updates should be done through the Supabase client on the frontend');
  }

  async uploadAvatar(
    id: string,
    file: { originalname: string; buffer: Buffer; mimetype: string },
  ) {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase storage
    const { error: uploadError } = await this.supabaseService
      .getClient()
      .storage.from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new ConflictException(uploadError.message);
    }

    // Get public URL
    const { data: urlData } = this.supabaseService
      .getClient()
      .storage.from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update profile with new avatar URL
    await this.updateProfile(id, { avatarUrl });

    return { avatarUrl };
  }
}
