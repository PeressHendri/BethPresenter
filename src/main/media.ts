import { app, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getMediaLibrary() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, media };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function importMedia(filePaths?: string[]) {
  const userDataPath = app.getPath('userData');
  const assetsDir = path.join(userDataPath, 'assets', 'media');
  
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  let paths = filePaths;
  if (!paths) {
    const { canceled, filePaths: selected } = await dialog.showOpenDialog({
      title: 'Upload Media Assets',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Media', extensions: ['jpg', 'png', 'mp4', 'mov', 'avi'] }]
    });
    if (canceled) return { success: false, files: [] };
    paths = selected;
  }

  const imported = [];
  for (const srcPath of paths) {
    try {
      const filename = `${Date.now()}_${path.basename(srcPath)}`;
      const destPath = path.join(assetsDir, filename);
      
      fs.copyFileSync(srcPath, destPath);
      
      const stats = fs.statSync(destPath);
      const isVideo = ['.mp4', '.mov', '.avi'].includes(path.extname(srcPath).toLowerCase());
      
      const media = await prisma.media.create({
        data: {
          filename: path.basename(srcPath),
          filepath: destPath,
          type: isVideo ? 'video' : 'image',
          createdAt: new Date()
        }
      });
      
      imported.push({
        ...media,
        size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
    } catch (err) {
      console.error('Failed to import:', srcPath, err);
    }
  }

  return { success: true, files: imported };
}

export async function deleteMedia(id: string) {
  try {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return { success: false, error: 'Asset not found' };

    if (fs.existsSync(media.filepath)) {
      fs.unlinkSync(media.filepath);
    }

    await prisma.media.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getStorageInfo() {
  try {
    // This is a simple approximation
    const userDataPath = app.getPath('userData');
    const stats = fs.statSync(userDataPath);
    // In real app, use diskusage or similar for actual HD info
    return { 
      success: true, 
      used: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
      path: userDataPath
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
