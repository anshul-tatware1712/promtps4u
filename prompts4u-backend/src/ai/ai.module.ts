import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PerplexityClient } from './perplexity.client';
import { AiService } from './ai.service';
import { MediaSuggesterService } from './media-suggester.service';

@Module({
  imports: [ConfigModule],
  providers: [PerplexityClient, AiService, MediaSuggesterService],
  exports: [PerplexityClient, AiService, MediaSuggesterService],
})
export class AiModule {}
