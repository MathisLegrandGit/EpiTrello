import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LabelsService } from './labels.service';
import type { Label } from './labels.service';

@Controller('labels')
export class LabelsController {
    constructor(private readonly labelsService: LabelsService) { }

    @Get()
    findAll(@Query('boardId') boardId?: string): Promise<Label[]> {
        return this.labelsService.findAll(boardId);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Label> {
        return this.labelsService.findOne(id);
    }

    @Post()
    create(@Body() label: Label): Promise<Label> {
        return this.labelsService.create(label);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() label: Partial<Label>): Promise<Label> {
        return this.labelsService.update(id, label);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.labelsService.remove(id);
    }
}
