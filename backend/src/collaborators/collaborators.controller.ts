import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';

@Controller('boards')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  /**
   * Get all collaborators for a board
   */
  @Get(':boardId/collaborators')
  async getCollaborators(@Param('boardId') boardId: string) {
    return this.collaboratorsService.getCollaborators(boardId);
  }

  /**
   * Add a collaborator to a board
   */
  @Post(':boardId/collaborators')
  async addCollaborator(
    @Param('boardId') boardId: string,
    @Body() body: { userId: string; invitedBy: string; role?: string },
  ) {
    return this.collaboratorsService.addCollaborator(
      boardId,
      body.userId,
      body.invitedBy,
      body.role || 'editor',
    );
  }

  /**
   * Respond to an invitation
   */
  @Post(':boardId/collaborators/respond')
  async respondToInvitation(
    @Param('boardId') boardId: string,
    @Body() body: { userId: string; accept: boolean },
  ) {
    return this.collaboratorsService.respondToInvitation(
      boardId,
      body.userId,
      body.accept,
    );
  }

  /**
   * Update a collaborator's role
   */
  @Patch(':boardId/collaborators/:userId/role')
  async updateCollaboratorRole(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Body() body: { role: string; requesterId: string },
  ) {
    return this.collaboratorsService.updateCollaboratorRole(
      boardId,
      userId,
      body.role,
      body.requesterId,
    );
  }

  /**
   * Remove a collaborator from a board
   */
  @Delete(':boardId/collaborators/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCollaborator(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Body() body: { requesterId: string },
  ) {
    await this.collaboratorsService.removeCollaborator(
      boardId,
      userId,
      body.requesterId,
    );
  }

  /**
   * Get boards shared with a user
   */
  @Get('shared/:userId')
  async getSharedBoards(@Param('userId') userId: string) {
    return this.collaboratorsService.getSharedBoards(userId);
  }
}
