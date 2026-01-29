import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class SendFriendRequestDto {
  @IsString()
  @IsNotEmpty()
  fromUserId: string;

  @IsString()
  @IsNotEmpty()
  toUserId: string;
}

export class UpdateFriendRequestDto {
  @IsEnum(['accepted', 'rejected'])
  status: 'accepted' | 'rejected';
}

export class SearchUsersDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsString()
  @IsOptional()
  excludeUserId?: string;
}
