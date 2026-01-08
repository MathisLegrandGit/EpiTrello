import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import type { List } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  findAll(@Query('boardId') boardId?: string): Promise<List[]> {
    return this.listsService.findAll(boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<List> {
    return this.listsService.findOne(id);
  }

  @Post()
  create(@Body() list: List): Promise<List> {
    return this.listsService.create(list);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() list: Partial<List>): Promise<List> {
    return this.listsService.update(id, list);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.listsService.remove(id);
  }
}
