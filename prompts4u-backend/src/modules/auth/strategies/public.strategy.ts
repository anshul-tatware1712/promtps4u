import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

@Injectable()
export class PublicStrategy extends PassportStrategy(Strategy, 'public') {
  async validate(): Promise<null> {
    // Always return null for public routes - no authentication required
    return null;
  }
}
