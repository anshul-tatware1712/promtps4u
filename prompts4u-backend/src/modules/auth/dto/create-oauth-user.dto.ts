import { IsString, IsOptional } from 'class-validator';

export class CreateOAuthUserDto {
  @IsString()
  @IsOptional()
  providerId?: string;

  @IsString()
  provider: string;

  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
