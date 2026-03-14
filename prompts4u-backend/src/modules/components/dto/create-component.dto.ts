import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreateComponentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['free', 'paid'])
  tier: 'free' | 'paid';

  @IsString()
  @IsNotEmpty()
  promptContent: string;

  @IsOptional()
  @IsString()
  previewImageUrl?: string;

  @IsOptional()
  @IsString()
  previewCode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
