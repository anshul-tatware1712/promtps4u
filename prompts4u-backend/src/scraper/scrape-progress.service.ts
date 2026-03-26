import { Injectable, Logger } from '@nestjs/common';
import * as http from 'http';

export interface ScrapeProgressEvent {
  type: 'progress' | 'status_change' | 'completed' | 'failed' | 'stage_update';
  pageId: string;
  progress?: number;
  status?: string;
  stage?: string;
  message?: string;
  error?: string;
  timestamp: string;
}

type SseResponse = http.ServerResponse;

@Injectable()
export class ScrapeProgressService {
  private readonly logger = new Logger(ScrapeProgressService.name);
  private clients: Map<string, Set<SseResponse>> = new Map();

  /**
   * Add a client to listen to a specific page's progress
   */
  addClient(pageId: string, res: SseResponse) {
    if (!this.clients.has(pageId)) {
      this.clients.set(pageId, new Set());
    }
    this.clients.get(pageId)!.add(res);
    this.logger.debug(`Client added for page ${pageId}`);
  }

  /**
   * Add a client to listen to all scrapes
   */
  addGlobalClient(res: SseResponse) {
    if (!this.clients.has('global')) {
      this.clients.set('global', new Set());
    }
    this.clients.get('global')!.add(res);
    this.logger.debug(`Global client added`);
  }

  /**
   * Remove a client
   */
  removeClient(pageId: string, res: SseResponse) {
    const clients = this.clients.get(pageId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        this.clients.delete(pageId);
      }
    }
  }

  /**
   * Send progress event to clients
   */
  send(pageId: string, event: ScrapeProgressEvent) {
    // Send to specific page clients
    const pageClients = this.clients.get(pageId);
    if (pageClients) {
      pageClients.forEach((res) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      });
    }

    // Send to global clients
    const globalClients = this.clients.get('global');
    if (globalClients) {
      globalClients.forEach((res) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      });
    }

    this.logger.debug(`Sent progress for page ${pageId}: ${event.progress}%`);
  }

  /**
   * Broadcast stage update
   */
  broadcastStageUpdate(
    pageId: string,
    stage: string,
    progress: number,
    message?: string,
  ) {
    this.send(pageId, {
      type: 'stage_update',
      pageId,
      stage,
      progress,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast completion
   */
  broadcastCompletion(pageId: string, promptCount: number) {
    this.send(pageId, {
      type: 'completed',
      pageId,
      progress: 100,
      status: 'completed',
      message: `Completed! Generated ${promptCount} prompts`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast failure
   */
  broadcastFailure(pageId: string, error: string) {
    this.send(pageId, {
      type: 'failed',
      pageId,
      progress: 0,
      status: 'failed',
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
