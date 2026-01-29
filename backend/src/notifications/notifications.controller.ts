import { Controller, Get, Patch, Delete, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get(':userId')
  async getAll(@Param('userId') userId: string) {
    return this.notificationsService.getAll(userId);
  }

  @Get(':userId/unread-count')
  async getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':notificationId/read')
  async markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationsService.markAsRead(notificationId);
  }

  @Patch(':userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':notificationId')
  async delete(@Param('notificationId') notificationId: string) {
    return this.notificationsService.delete(notificationId);
  }
}
