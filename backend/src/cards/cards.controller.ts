import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CardsService } from './cards.service';
import type { Card } from './cards.service';

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
}
