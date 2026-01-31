import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CardsService } from './cards.service';
import type { Card, CardAttachment } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  findAll(@Query('listId') listId?: string): Promise<Card[]> {
    return this.cardsService.findAll(listId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Card> {
    return this.cardsService.findOne(id);
  }

  @Post()
  create(@Body() card: Card): Promise<Card> {
    return this.cardsService.create(card);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() card: Partial<Card>): Promise<Card> {
    return this.cardsService.update(id, card);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.cardsService.remove(id);
  }

  // Attachment endpoints
  @Get(':id/attachments')
  getAttachments(@Param('id') id: string): Promise<CardAttachment[]> {
    return this.cardsService.getAttachments(id);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  addAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CardAttachment> {
    return this.cardsService.addAttachment(id, file);
  }

  @Delete('attachments/:attachmentId')
  removeAttachment(@Param('attachmentId') attachmentId: string): Promise<void> {
    return this.cardsService.removeAttachment(attachmentId);
  }
}
