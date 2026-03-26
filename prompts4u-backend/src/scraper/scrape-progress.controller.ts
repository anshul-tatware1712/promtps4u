import { Controller, Get, Param, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ScrapeProgressService } from './scrape-progress.service';

@Controller('sse')
export class ScrapeProgressController {
  constructor(
    private readonly progressService: ScrapeProgressService,
  ) {}

  /**
   * SSE endpoint for all scrape progress events
   */
  @Get('scrape-progress')
  scrapeProgress(@Res() reply: FastifyReply) {
    // Set headers for SSE with CORS
    reply.header('Content-Type', 'text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');
    reply.header('X-Accel-Buffering', 'no');
    reply.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    reply.header('Access-Control-Allow-Credentials', 'true');

    // Send initial connection message
    reply.send(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to scrape progress stream' })}\n\n`);

    // Register as global client - use reply.raw for the actual HTTP response
    this.progressService.addGlobalClient(reply.raw);

    // Clean up on close
    reply.raw.req.on('close', () => {
      this.progressService.removeClient('global', reply.raw);
    });
  }

  /**
   * SSE endpoint for specific page progress
   */
  @Get('scrape-progress/:pageId')
  pageProgress(@Param('pageId') pageId: string, @Res() reply: FastifyReply) {
    // Set headers for SSE with CORS
    reply.header('Content-Type', 'text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');
    reply.header('X-Accel-Buffering', 'no');
    reply.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    reply.header('Access-Control-Allow-Credentials', 'true');

    // Send initial connection message
    reply.send(`data: ${JSON.stringify({ type: 'connected', pageId, message: `Connected to progress stream for page ${pageId}` })}\n\n`);

    // Register as client for this page
    this.progressService.addClient(pageId, reply.raw);

    // Clean up on close
    reply.raw.req.on('close', () => {
      this.progressService.removeClient(pageId, reply.raw);
    });
  }
}
