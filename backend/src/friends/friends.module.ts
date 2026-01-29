import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { NotificationsController } from './notifications.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [FriendsController, NotificationsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
