import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
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

    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signUp({
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

    return {
      user: data.user,
      session: data.session,
    };
  }

  async logout(accessToken: string) {
    const { error } = await this.supabaseService
      .getClient()
      .auth.signOut();

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { message: 'Logged out successfully' };
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const { username, fullName, avatarUrl } = updateProfileDto;

    // Update profiles table
    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .update({
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ConflictException(error.message);
    }

    // Also update auth user metadata for consistency if needed, 
    // but primarily we rely on profiles table now.
    // Let's explicitly update user metadata too for sync
    await this.supabaseService.getClient().auth.admin.updateUserById(id, {
      user_metadata: {
        username,
        full_name: fullName,
        avatar_url: avatarUrl
      }
    });

    return data;
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const { password } = updatePasswordDto;

    const { data, error } = await this.supabaseService
      .getClient()
      .auth.admin.updateUserById(id, {
        password: password
      });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { message: 'Password updated successfully' };
  }
}
