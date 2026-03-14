import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateOAuthUserDto {
  @IsString()
  @IsOptional()
  providerId?: string;

  @IsString()
  provider: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
