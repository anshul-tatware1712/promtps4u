import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  subscriptionId: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['active', 'cancelled', 'free'])
  status: 'active' | 'cancelled' | 'free';

  @IsOptional()
  @IsDateString()
  subscriptionEnd?: string;
}
