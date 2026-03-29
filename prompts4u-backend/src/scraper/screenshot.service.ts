import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Injectable()
export class ScreenshotService {
  private readonly logger = new Logger(ScreenshotService.name);
  private readonly r2Client: S3Client | null = null;
  private readonly useR2: boolean;
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    const r2Endpoint = this.configService.get<string>('R2_ENDPOINT');
    const r2AccessKey = this.configService.get<string>('R2_ACCESS_KEY');
    const r2SecretKey = this.configService.get<string>('R2_SECRET_KEY');

    this.useR2 = !!(r2Endpoint && r2AccessKey && r2SecretKey);

    if (this.useR2) {
      this.r2Client = new S3Client({
        region: 'auto',
        endpoint: r2Endpoint,
        credentials: {
          accessKeyId: r2AccessKey,
          secretAccessKey: r2SecretKey,
        },
      });
      this.logger.log('ScreenshotService: Using Cloudflare R2 storage');
    } else {
      this.uploadDir = this.configService.get<string>('LOCAL_UPLOAD_DIR') || './uploads';
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
      this.logger.log('ScreenshotService: Using local file storage (R2 not configured)');
    }
  }

  async uploadFullPage(pageId: string, buffer: Buffer): Promise<string> {
    if (this.useR2 && this.r2Client) {
      return this.uploadToR2(`pages/${pageId}/full.png`, buffer);
    } else {
      return this.uploadLocal(`pages/${pageId}/full.png`, buffer);
    }
  }

  async cropComponent(
    fullBuffer: Buffer,
    componentId: string,
    rect: CropRect,
  ): Promise<string> {
    try {
      const meta = await sharp(fullBuffer).metadata();
      const safeRect = {
        left: Math.max(0, rect.x),
        top: Math.max(0, rect.y),
        width: Math.min(rect.width, (meta.width || 0) - rect.x),
        height: Math.min(rect.height, (meta.height || 0) - rect.y),
      };

      const cropped = await sharp(fullBuffer)
        .extract(safeRect)
        .png()
        .toBuffer();

      if (this.useR2 && this.r2Client) {
        return this.uploadToR2(`components/${componentId}/crop.png`, cropped);
      } else {
        return this.uploadLocal(`components/${componentId}/crop.png`, cropped);
      }
    } catch (error) {
      this.logger.error(`Failed to crop component screenshot: ${error.message}`);
      throw error;
    }
  }

  private async uploadToR2(key: string, buffer: Buffer): Promise<string> {
    const bucket = this.configService.get<string>('R2_BUCKET');
    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL');

    try {
      await this.r2Client!.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: 'image/png',
          ACL: 'public-read',
        }),
      );

      const url = `${publicUrl}/${key}`;
      this.logger.log(`Screenshot uploaded to R2: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(`R2 upload failed: ${error.message}`);
      throw new Error(`Failed to upload to R2: ${error.message}`);
    }
  }

  private async uploadLocal(key: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(this.uploadDir, key);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/${key}`;
    this.logger.log(`Screenshot saved locally: ${localUrl}`);
    return localUrl;
  }
}
