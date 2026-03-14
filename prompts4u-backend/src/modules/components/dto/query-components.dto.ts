import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryComponentsDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  tier?: 'free' | 'paid';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => {
    if (!value || value === '') return 1;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  })
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => {
    if (!value || value === '') return 20;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < 1 ? 20 : parsed;
  })
  limit?: number = 20;
}
