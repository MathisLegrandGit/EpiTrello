import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import {
  SendFriendRequestDto,
  UpdateFriendRequestDto,
} from './dto/friends.dto';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  /**
   * Search users by username or email
   * GET /friends/search?q=<query>&excludeUserId=<userId>
   */
  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query('excludeUserId') excludeUserId?: string,
  ) {
    return this.friendsService.searchUsers(query, excludeUserId);
  }

  /**
   * Get user's friends list
   * GET /friends/:userId
   */
  @Get(':userId')
  async getFriends(@Param('userId') userId: string) {
    return this.friendsService.getFriends(userId);
  }

  /**
   * Get a user profile by ID
   * GET /friends/profile/:userId
   */
  @Get('profile/:userId')
  async getProfile(@Param('userId') userId: string) {
    return this.friendsService.getProfile(userId);
  }

  /**
   * Send a friend request
   * POST /friends/request
   */
  @Post('request')
  async sendFriendRequest(@Body() dto: SendFriendRequestDto) {
    return this.friendsService.sendFriendRequest(dto.fromUserId, dto.toUserId);
  }

  /**
   * Get pending incoming requests for a user
   * GET /friends/requests/:userId/incoming
   */
  @Get('requests/:userId/incoming')
  async getPendingRequests(@Param('userId') userId: string) {
    return this.friendsService.getPendingRequests(userId);
  }

  /**
   * Get sent outgoing requests for a user
   * GET /friends/requests/:userId/outgoing
   */
  @Get('requests/:userId/outgoing')
  async getSentRequests(@Param('userId') userId: string) {
    return this.friendsService.getSentRequests(userId);
  }

  /**
   * Respond to a friend request (accept/reject)
   * PATCH /friends/request/:requestId
   */
  @Patch('request/:requestId')
  async respondToRequest(
    @Param('requestId') requestId: string,
    @Body() dto: UpdateFriendRequestDto,
  ) {
    return this.friendsService.respondToFriendRequest(requestId, dto.status);
  }

  /**
   * Remove a friend
   * DELETE /friends/:userId/:friendId
   */
  @Delete(':userId/:friendId')
  async removeFriend(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string,
  ) {
    await this.friendsService.removeFriend(userId, friendId);
    return { message: 'Friend removed successfully' };
  }
}
