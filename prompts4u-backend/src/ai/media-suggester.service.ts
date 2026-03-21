import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface SuggestedMedia {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  source: 'pexels' | 'pixabay' | 'unsplash';
  credit: string;
  license: string;
}

@Injectable()
export class MediaSuggesterService {
  private readonly logger = new Logger(MediaSuggesterService.name);
  private readonly pexelsApiKey: string;
  private readonly pixabayApiKey: string;
  private readonly unsplashApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.pexelsApiKey = this.configService.get<string>('PEXELS_API_KEY') || '';
    this.pixabayApiKey = this.configService.get<string>('PIXABAY_API_KEY') || '';
    this.unsplashApiKey = this.configService.get<string>('UNSPLASH_ACCESS_KEY') || '';
  }

  /**
   * Suggest free media for a component
   */
  async suggestForComponent(
    componentType: string,
    keywords: string[],
    needsVideo: boolean,
  ): Promise<SuggestedMedia[]> {
    const results: SuggestedMedia[] = [];
    const query = keywords.join(' ');

    try {
      // 1. Pexels (best quality, free commercial use)
      if (needsVideo && this.pexelsApiKey) {
        const pexelsVideos = await this.searchPexelsVideos(query);
        results.push(...pexelsVideos.slice(0, 3));
      } else if (this.pexelsApiKey) {
        const pexelsImages = await this.searchPexelsImages(query);
        results.push(...pexelsImages.slice(0, 3));
      }
    } catch (error) {
      this.logger.error(`Pexels search failed: ${error.message}`);
    }

    try {
      // 2. Pixabay for images
      if (this.pixabayApiKey) {
        const pixabayImages = await this.searchPixabay(query, needsVideo);
        results.push(...pixabayImages.slice(0, 2));
      }
    } catch (error) {
      this.logger.error(`Pixabay search failed: ${error.message}`);
    }

    try {
      // 3. Unsplash for images (higher quality)
      if (this.unsplashApiKey && !needsVideo) {
        const unsplashImages = await this.searchUnsplash(query);
        results.push(...unsplashImages.slice(0, 2));
      }
    } catch (error) {
      this.logger.error(`Unsplash search failed: ${error.message}`);
    }

    return results;
  }

  /**
   * Search Pexels for videos
   */
  private async searchPexelsVideos(query: string): Promise<SuggestedMedia[]> {
    if (!this.pexelsApiKey) return [];

    const res = await axios.get('https://api.pexels.com/videos/search', {
      params: { query, per_page: 5, orientation: 'landscape' },
      headers: { Authorization: this.pexelsApiKey },
    });

    return (res.data.videos || []).map((v: any) => ({
      type: 'video' as const,
      url:
        v.video_files?.find((f: any) => f.quality === 'hd')?.link ||
        v.video_files?.[0]?.link,
      thumbnailUrl: v.image,
      source: 'pexels' as const,
      credit: `${v.user.name} on Pexels`,
      license: 'Pexels License (free commercial use)',
    }));
  }

  /**
   * Search Pexels for images
   */
  private async searchPexelsImages(query: string): Promise<SuggestedMedia[]> {
    if (!this.pexelsApiKey) return [];

    const res = await axios.get('https://api.pexels.com/v1/search', {
      params: { query, per_page: 5, orientation: 'landscape' },
      headers: { Authorization: this.pexelsApiKey },
    });

    return (res.data.photos || []).map((p: any) => ({
      type: 'image' as const,
      url: p.src.large2x,
      thumbnailUrl: p.src.medium,
      source: 'pexels' as const,
      credit: `${p.photographer} on Pexels`,
      license: 'Pexels License (free commercial use)',
    }));
  }

  /**
   * Search Pixabay for images or videos
   */
  private async searchPixabay(
    query: string,
    needsVideo: boolean,
  ): Promise<SuggestedMedia[]> {
    if (!this.pixabayApiKey) return [];

    const endpoint = needsVideo
      ? 'https://pixabay.com/api/videos/'
      : 'https://pixabay.com/api/';

    const res = await axios.get(endpoint, {
      params: {
        key: this.pixabayApiKey,
        q: query,
        per_page: 5,
        image_type: needsVideo ? undefined : 'photo',
      },
    });

    if (needsVideo) {
      return (res.data.hits || []).map((v: any) => ({
        type: 'video' as const,
        url: v.videos?.large?.url || v.videos?.hd?.url,
        thumbnailUrl: v.picture,
        source: 'pixabay' as const,
        credit: `${v.user} on Pixabay`,
        license: 'Pixabay License (free commercial use)',
      }));
    }

    return (res.data.hits || []).map((p: any) => ({
      type: 'image' as const,
      url: p.largeImageURL,
      thumbnailUrl: p.previewURL,
      source: 'pixabay' as const,
      credit: `${p.user} on Pixabay`,
      license: 'Pixabay License (free commercial use)',
    }));
  }

  /**
   * Search Unsplash for images
   */
  private async searchUnsplash(query: string): Promise<SuggestedMedia[]> {
    if (!this.unsplashApiKey) return [];

    const res = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 5, orientation: 'landscape' },
      headers: { Authorization: `Client-ID ${this.unsplashApiKey}` },
    });

    return (res.data.results || []).map((p: any) => ({
      type: 'image' as const,
      url: p.urls.full,
      thumbnailUrl: p.urls.small,
      source: 'unsplash' as const,
      credit: `${p.user.name} on Unsplash`,
      license: 'Unsplash License (free for commercial use)',
    }));
  }
}
