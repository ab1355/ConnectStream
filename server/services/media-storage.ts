import { promises as fs } from 'fs';
import path from 'path';
import { mediaFiles, type InsertMediaFile } from '@shared/schema';
import { db } from '../db';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw error;
  }
}

export class MediaStorageService {
  constructor() {
    ensureUploadDir();
  }

  async saveFile(file: Express.Multer.File, userId: number): Promise<InsertMediaFile> {
    const filename = `${Date.now()}-${file.originalname}`;
    const relativePath = path.join('uploads', filename);
    const fullPath = path.join(process.cwd(), relativePath);

    try {
      await fs.writeFile(fullPath, file.buffer);

      const [mediaFile] = await db.insert(mediaFiles)
        .values({
          filename: file.originalname,
          path: relativePath,
          mimeType: file.mimetype,
          size: file.size,
          uploaderId: userId,
        })
        .returning();

      return mediaFile;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  async getFilePath(fileId: number): Promise<string | null> {
    const [file] = await db.select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, fileId));

    return file ? file.path : null;
  }
}

export const mediaStorageService = new MediaStorageService();
