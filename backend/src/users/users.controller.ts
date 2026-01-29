import { Controller, Get, Query, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Search users by username or full_name
   * GET /users/search?q=<query>&excludeUserId=<userId>
   */
  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query('excludeUserId') excludeUserId?: string,
  ) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.usersService.searchUsers(query, excludeUserId);
  }

  /**
   * Get a user profile by ID
   * GET /users/profile/:userId
   */
  @Get('profile/:userId')
  async getProfile(@Param('userId') userId: string) {
    return this.usersService.getProfile(userId);
  }
}
