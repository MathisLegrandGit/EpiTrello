import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    SupabaseModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
  ],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
