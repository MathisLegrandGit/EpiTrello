import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
} from '@nestjs/common';
import { FriendsService } from './friends.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly friendsService: FriendsService) { }

    /**
     * Get all notifications for a user
     * GET /notifications/:userId
     */
    @Get(':userId')
    async getNotifications(@Param('userId') userId: string) {
        return this.friendsService.getNotifications(userId);
    }

    /**
     * Get unread notification count
     * GET /notifications/:userId/unread-count
     */
    @Get(':userId/unread-count')
    async getUnreadCount(@Param('userId') userId: string) {
        const count = await this.friendsService.getUnreadCount(userId);
        return { count };
    }

    /**
     * Mark a notification as read
     * PATCH /notifications/:id/read
     */
    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.friendsService.markNotificationRead(id);
    }

    /**
     * Mark all notifications as read
     * PATCH /notifications/:userId/read-all
     */
    @Patch(':userId/read-all')
    async markAllAsRead(@Param('userId') userId: string) {
        await this.friendsService.markAllNotificationsRead(userId);
        return { message: 'All notifications marked as read' };
    }

    /**
     * Delete a notification
     * DELETE /notifications/:id
     */
    @Delete(':id')
    async deleteNotification(@Param('id') id: string) {
        await this.friendsService.deleteNotification(id);
        return { message: 'Notification deleted' };
    }
}
