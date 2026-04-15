const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

class BackupManager {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.ensureBackupDir();
  }

  async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create backup directory:', error);
    }
  }

  // Export individual modules
  async exportSongs() {
    try {
      const songs = await prisma.song.findMany({
        orderBy: { createdAt: 'desc' }
      });

      const exportData = {
        version: '1.0.0',
        type: 'songs',
        exportedAt: new Date().toISOString(),
        data: songs.map(song => ({
          id: song.id,
          title: song.title,
          author: song.author,
          ccli: song.ccli,
          tags: JSON.parse(song.tags || '[]'),
          slides: JSON.parse(song.lyricsJson || '[]'),
          createdAt: song.createdAt,
          updatedAt: song.updatedAt
        }))
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Failed to export songs: ${error.message}`);
    }
  }

  async exportPresentations() {
    try {
      const presentations = await prisma.presentation.findMany({
        include: {
          items: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const exportData = {
        version: '1.0.0',
        type: 'presentations',
        exportedAt: new Date().toISOString(),
        data: presentations.map(presentation => ({
          id: presentation.id,
          name: presentation.name,
          createdAt: presentation.createdAt,
          updatedAt: presentation.updatedAt,
          items: presentation.items
        }))
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Failed to export presentations: ${error.message}`);
    }
  }

  async exportMedia() {
    try {
      const media = await prisma.media.findMany({
        orderBy: { createdAt: 'desc' }
      });

      const exportData = {
        version: '1.0.0',
        type: 'media',
        exportedAt: new Date().toISOString(),
        data: media.map(item => ({
          id: item.id,
          name: item.original_name,
          type: item.type,
          size: item.size,
          path: item.path,
          thumbnail: item.thumbnail,
          duration: item.duration,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }))
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Failed to export media: ${error.message}`);
    }
  }

  // Full backup with media files
  async exportFull() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `beth_backup_${timestamp}.zip`);
      
      // Get all data first
      const songsData = await this.exportSongsData();
      const presentationsData = await this.exportPresentationsData();
      const mediaData = await this.exportMediaData();
      
      // Create zip file
      const output = require('fs').createWriteStream(backupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          resolve(backupPath);
        });

        archive.on('error', (err) => {
          reject(err);
        });

        archive.pipe(output);

        // Add JSON files
        archive.append(JSON.stringify({
          version: '1.0.0',
          type: 'songs',
          exportedAt: new Date().toISOString(),
          data: songsData
        }, null, 2), { name: 'songs.json' });

        archive.append(JSON.stringify({
          version: '1.0.0',
          type: 'presentations',
          exportedAt: new Date().toISOString(),
          data: presentationsData
        }, null, 2), { name: 'presentations.json' });

        archive.append(JSON.stringify({
          version: '1.0.0',
          type: 'media',
          exportedAt: new Date().toISOString(),
          data: mediaData
        }, null, 2), { name: 'media.json' });

        // Add settings
        archive.append(JSON.stringify({
          version: '1.0.0',
          type: 'settings',
          exportedAt: new Date().toISOString(),
          data: {
            // Add any settings you want to backup
          }
        }, null, 2), { name: 'settings.json' });

        // Add media files
        this.addMediaFilesToArchive(archive).then(() => {
          archive.finalize();
        }).catch(reject);
      });
    } catch (error) {
      throw new Error(`Failed to create full backup: ${error.message}`);
    }
  }

  async exportSongsData() {
    const songs = await prisma.song.findMany();
    return songs.map(song => ({
      id: song.id,
      title: song.title,
      author: song.author,
      ccli: song.ccli,
      tags: JSON.parse(song.tags || '[]'),
      slides: JSON.parse(song.lyricsJson || '[]'),
      createdAt: song.createdAt,
      updatedAt: song.updatedAt
    }));
  }

  async exportPresentationsData() {
    const presentations = await prisma.presentation.findMany({
      include: { items: true }
    });
    return presentations.map(presentation => ({
      id: presentation.id,
      name: presentation.name,
      createdAt: presentation.createdAt,
      updatedAt: presentation.updatedAt,
      items: presentation.items
    }));
  }

  async exportMediaData() {
    const media = await prisma.media.findMany();
    return media.map(item => ({
      id: item.id,
      name: item.original_name,
      type: item.type,
      size: item.size,
      path: item.path,
      thumbnail: item.thumbnail,
      duration: item.duration,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async addMediaFilesToArchive(archive) {
    try {
      const media = await prisma.media.findMany();
      const assetsDir = path.join(__dirname, '../../assets/media');

      for (const item of media) {
        const filePath = path.join(assetsDir, item.path);
        try {
          await fs.access(filePath);
          archive.file(filePath, { name: `media/${item.path}` });
        } catch (error) {
          console.warn(`Media file not found: ${filePath}`);
        }
      }
    } catch (error) {
      console.warn('Failed to add media files to archive:', error);
    }
  }

  // Import functions
  async importSongs(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      let imported = 0;
      let duplicates = 0;

      for (const song of data.data) {
        // Check for duplicates
        const existing = await prisma.song.findFirst({
          where: {
            OR: [
              { id: song.id },
              { title: song.title, author: song.author }
            ]
          }
        });

        if (existing) {
          duplicates++;
          continue;
        }

        await prisma.song.create({
          data: {
            id: song.id,
            title: song.title,
            author: song.author,
            ccli: song.ccli,
            tags: JSON.stringify(song.tags || []),
            lyricsJson: JSON.stringify(song.slides || []),
            createdAt: song.createdAt || new Date(),
            updatedAt: song.updatedAt || new Date()
          }
        });

        imported++;
      }

      return { imported, duplicates };
    } catch (error) {
      throw new Error(`Failed to import songs: ${error.message}`);
    }
  }

  async importPresentations(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      let imported = 0;
      let duplicates = 0;

      for (const presentation of data.data) {
        // Check for duplicates
        const existing = await prisma.presentation.findFirst({
          where: {
            OR: [
              { id: presentation.id },
              { name: presentation.name }
            ]
          }
        });

        if (existing) {
          duplicates++;
          continue;
        }

        await prisma.presentation.create({
          data: {
            id: presentation.id,
            name: presentation.name,
            createdAt: presentation.createdAt || new Date(),
            updatedAt: presentation.updatedAt || new Date(),
            items: presentation.items || []
          }
        });

        imported++;
      }

      return { imported, duplicates };
    } catch (error) {
      throw new Error(`Failed to import presentations: ${error.message}`);
    }
  }

  async importMedia(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      let imported = 0;
      let duplicates = 0;

      for (const item of data.data) {
        // Check for duplicates
        const existing = await prisma.media.findFirst({
          where: {
            OR: [
              { id: item.id },
              { original_name: item.name }
            ]
          }
        });

        if (existing) {
          duplicates++;
          continue;
        }

        await prisma.media.create({
          data: {
            id: item.id,
            original_name: item.name,
            type: item.type,
            size: item.size,
            path: item.path,
            thumbnail: item.thumbnail,
            duration: item.duration,
            createdAt: item.createdAt || new Date(),
            updatedAt: item.updatedAt || new Date()
          }
        });

        imported++;
      }

      return { imported, duplicates };
    } catch (error) {
      throw new Error(`Failed to import media: ${error.message}`);
    }
  }

  async importFull(zipPath) {
    try {
      const yauzl = require('yauzl');
      const fs = require('fs');
      
      return new Promise((resolve, reject) => {
        const results = {
          songs: 0,
          presentations: 0,
          media: 0
        };

        yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
          if (err) {
            reject(err);
            return;
          }

          zipfile.readEntry();
          
          zipfile.on('entry', async (entry) => {
            if (/\/$/.test(entry.fileName)) {
              // Directory entry
              zipfile.readEntry();
            } else {
              // File entry
              zipfile.openReadStream(entry, (err, readStream) => {
                if (err) {
                  reject(err);
                  return;
                }

                const chunks = [];
                readStream.on('data', (chunk) => {
                  chunks.push(chunk);
                });

                readStream.on('end', async () => {
                  const content = Buffer.concat(chunks);
                  
                  try {
                    if (entry.fileName === 'songs.json') {
                      const json = JSON.parse(content.toString());
                      const result = await this.importSongs(json);
                      results.songs = result.imported;
                    } else if (entry.fileName === 'presentations.json') {
                      const json = JSON.parse(content.toString());
                      const result = await this.importPresentations(json);
                      results.presentations = result.imported;
                    } else if (entry.fileName === 'media.json') {
                      const json = JSON.parse(content.toString());
                      const result = await this.importMedia(json);
                      results.media = result.imported;
                    } else if (entry.fileName.startsWith('media/')) {
                      // Extract media files
                      const assetsDir = path.join(__dirname, '../../assets/media');
                      const filePath = path.join(assetsDir, entry.fileName.replace('media/', ''));
                      
                      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                      await fs.promises.writeFile(filePath, content);
                    }
                  } catch (error) {
                    console.warn(`Failed to process ${entry.fileName}:`, error);
                  }

                  zipfile.readEntry();
                });

                readStream.on('error', reject);
              });
            }
          });

          zipfile.on('end', () => {
            resolve(results);
          });

          zipfile.on('error', reject);
        });
      });
    } catch (error) {
      throw new Error(`Failed to import full backup: ${error.message}`);
    }
  }
}

module.exports = BackupManager;
