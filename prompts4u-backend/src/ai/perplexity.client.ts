import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface PerplexityResponse {
  output_text: string;
  model: string;
}

@Injectable()
export class PerplexityClient {
  private readonly logger = new Logger(PerplexityClient.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly model: string;

  private readonly provider: 'alibaba' | 'perplexity' = 'alibaba';

  constructor(private readonly configService: ConfigService) {
    const alibabaApiKey = this.configService.get<string>('ALIBABA_API_KEY');
    const perplexityApiKey =
      this.configService.get<string>('PERPLEXITY_API_KEY');

    if (this.provider === 'alibaba') {
      // Alibaba DashScope - Qwen 3.5 (Singapore endpoint)
      this.model = 'qwen3.5-122b-a10b';
      this.axiosInstance = axios.create({
        baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
        headers: {
          Authorization: `Bearer ${alibabaApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      });
      this.logger.log(
        `PerplexityClient initialized with Alibaba Qwen: ${this.model}`,
      );
    } else {
      // Perplexity AI - Latest model
      this.model = 'sonar';
      this.axiosInstance = axios.create({
        baseURL: 'https://api.perplexity.ai',
        headers: {
          Authorization: `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      });
      this.logger.log(
        `PerplexityClient initialized with Perplexity: ${this.model}`,
      );
    }
  }

  /**
   * Send a chat completion request to AI provider
   */
  async chat(
    systemPrompt: string,
    userContent: string,
    jsonMode = false,
  ): Promise<string> {
    try {
      if (this.provider === 'alibaba') {
        return await this.chatWithAlibaba(systemPrompt, userContent, jsonMode);
      } else {
        return await this.chatWithPerplexity(
          systemPrompt,
          userContent,
          jsonMode,
        );
      }
    } catch (error) {
      this.logger.error(
        `AI API error: ${error.response?.status || 'unknown'}`,
        error.response?.data || error.message,
      );
      throw new Error(
        `AI API error: ${error.response?.status || 'unknown'} - ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Chat with Alibaba DashScope (Qwen) - OpenAI compatible mode
   */
  private async chatWithAlibaba(
    systemPrompt: string,
    userContent: string,
    jsonMode: boolean,
  ): Promise<string> {
    const response = await this.axiosInstance.post('/chat/completions', {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: jsonMode ? 0.1 : 0.7,
      max_tokens: jsonMode ? 4000 : 2000,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    });

    return response.data.choices?.[0]?.message?.content || '';
  }

  /**
   * Chat with Perplexity AI (GPT-4)
   * Uncomment and switch provider to use this
   */
  private async chatWithPerplexity(
    systemPrompt: string,
    userContent: string,
    jsonMode: boolean,
  ): Promise<string> {
    // Using Perplexity AI SDK approach via REST API
    const payload: any = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: jsonMode ? 0.1 : 0.4,
      max_tokens: jsonMode ? 4000 : 2000,
    };

    // Perplexity doesn't support json_object format, so we omit response_format
    // and rely on the system prompt to guide JSON output

    const response = await this.axiosInstance.post(
      '/chat/completions',
      payload,
    );

    return response.data.choices?.[0]?.message?.content || '';
  }
}
