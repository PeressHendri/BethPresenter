const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class PowerPointService {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  async importPowerPoint(filePath) {
    try {
      const fileName = path.basename(filePath, path.extname(filePath));
      const tempPath = path.join(this.tempDir, `ppt_${Date.now()}`);
      
      // Create temp directory for extraction
      await fs.mkdir(tempPath, { recursive: true });

      // Extract PowerPoint using python-pptx (if available) or other method
      const slides = await this.extractSlides(filePath, tempPath);

      // Clean up temp directory
      await fs.rm(tempPath, { recursive: true, force: true });

      return {
        slides,
        slideCount: slides.length,
        fileName: fileName
      };
    } catch (error) {
      console.error('PowerPoint import error:', error);
      throw new Error(`Failed to import PowerPoint: ${error.message}`);
    }
  }

  async extractSlides(filePath, tempPath) {
    try {
      // Method 1: Try using python-pptx if available
      try {
        return await this.extractWithPython(filePath, tempPath);
      } catch (pythonError) {
        console.warn('Python extraction failed, trying alternative method:', pythonError.message);
      }

      // Method 2: Try using LibreOffice if available
      try {
        return await this.extractWithLibreOffice(filePath, tempPath);
      } catch (libreError) {
        console.warn('LibreOffice extraction failed, trying basic method:', libreError.message);
      }

      // Method 3: Basic XML parsing (limited but works for simple PPTX)
      return await this.extractBasicXML(filePath, tempPath);
    } catch (error) {
      throw new Error(`All extraction methods failed: ${error.message}`);
    }
  }

  async extractWithPython(filePath, tempPath) {
    const pythonScript = `
import sys
import json
import zipfile
import xml.etree.ElementTree as ET
from pptx import Presentation

def extract_pptx_slides(pptx_path):
    try:
        prs = Presentation(pptx_path)
        slides_data = []
        
        for i, slide in enumerate(prs.slides):
            slide_data = {
                'title': '',
                'content': '',
                'backgroundImage': None,
                'notes': ''
            }
            
            # Extract text from slide
            text_content = []
            for shape in slide.shapes:
                if hasattr(shape, 'text') and shape.text:
                    text_content.append(shape.text.strip())
                    if not slide_data['title'] and shape.text.strip():
                        slide_data['title'] = shape.text.strip()
            
            slide_data['content'] = '\\n'.join(text_content)
            
            # Extract notes
            if slide.has_notes_slide:
                notes_text = []
                for shape in slide.notes_slide.shapes:
                    if hasattr(shape, 'text') and shape.text:
                        notes_text.append(shape.text.strip())
                slide_data['notes'] = '\\n'.join(notes_text)
            
            slides_data.append(slide_data)
        
        return slides_data
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return []

if __name__ == "__main__":
    pptx_path = sys.argv[1]
    output_path = sys.argv[2]
    
    slides = extract_pptx_slides(pptx_path)
    
    with open(output_path, 'w') as f:
        json.dump(slides, f, indent=2)
    
    print(f"Extracted {len(slides)} slides")
`;

    const scriptPath = path.join(tempPath, 'extract_pptx.py');
    const outputPath = path.join(tempPath, 'slides.json');

    // Write Python script
    await fs.writeFile(scriptPath, pythonScript);

    // Execute Python script
    await execAsync(`python "${scriptPath}" "${filePath}" "${outputPath}"`);

    // Read results
    const resultData = await fs.readFile(outputPath, 'utf8');
    const slides = JSON.parse(resultData);

    return slides;
  }

  async extractWithLibreOffice(filePath, tempPath) {
    // Convert PPTX to images using LibreOffice
    const imagesPath = path.join(tempPath, 'images');
    await fs.mkdir(imagesPath, { recursive: true });

    try {
      // Convert to PNG images
      await execAsync(`libreoffice --headless --convert-to png --outdir "${imagesPath}" "${filePath}"`);

      // Get list of generated images
      const imageFiles = await fs.readdir(imagesPath);
      const pngFiles = imageFiles.filter(file => file.endsWith('.png')).sort();

      // Create slide data from images
      const slides = pngFiles.map((file, index) => ({
        title: `Slide ${index + 1}`,
        content: '', // No text extraction with this method
        backgroundImage: path.join(imagesPath, file),
        notes: ''
      }));

      return slides;
    } catch (error) {
      throw new Error(`LibreOffice conversion failed: ${error.message}`);
    }
  }

  async extractBasicXML(filePath, tempPath) {
    // Basic XML parsing for .pptx files (limited functionality)
    const slides = [];
    
    try {
      // PPTX is a ZIP file containing XML
      const zip = require('yauzl');
      
      return new Promise((resolve, reject) => {
        zip.open(filePath, { lazyEntries: true }, (err, zipfile) => {
          if (err) {
            reject(err);
            return;
          }

          const slideFiles = [];
          
          zipfile.readEntry();
          
          zipfile.on('entry', (entry) => {
            if (entry.fileName.startsWith('ppt/slides/slide') && entry.fileName.endsWith('.xml')) {
              slideFiles.push(entry.fileName);
            }
            zipfile.readEntry();
          });

          zipfile.on('end', async () => {
            try {
              // Sort slide files by number
              slideFiles.sort();
              
              for (const slideFile of slideFiles) {
                const slideData = await this.extractSlideXML(zipfile, slideFile);
                slides.push(slideData);
              }
              
              resolve(slides);
            } catch (error) {
              reject(error);
            }
          });

          zipfile.on('error', reject);
        });
      });
    } catch (error) {
      throw new Error(`XML extraction failed: ${error.message}`);
    }
  }

  async extractSlideXML(zipfile, slideFile) {
    // This is a simplified version - in production, you'd want more robust XML parsing
    return new Promise((resolve, reject) => {
      zipfile.openReadStream(slideFile, (err, readStream) => {
        if (err) {
          reject(err);
          return;
        }

        let xmlData = '';
        readStream.on('data', (chunk) => {
          xmlData += chunk.toString();
        });

        readStream.on('end', () => {
          try {
            // Basic text extraction from XML
            const textMatches = xmlData.match(/<a:t>([^<]+)<\/a:t>/g);
            const textContent = textMatches ? textMatches.map(match => 
              match.replace(/<\/?a:t>/g, '').trim()
            ).filter(text => text).join('\n') : '';

            resolve({
              title: textContent.split('\n')[0] || 'Untitled Slide',
              content: textContent,
              backgroundImage: null,
              notes: ''
            });
          } catch (error) {
            reject(error);
          }
        });

        readStream.on('error', reject);
      });
    });
  }

  // Fallback method for when no extraction works
  async createFallbackSlides(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Create a simple slide based on filename
    return [{
      title: fileName,
      content: `PowerPoint Presentation: ${fileName}\n\n(Preview not available - please open in PowerPoint to view content)`,
      backgroundImage: null,
      notes: 'This is a placeholder slide. The actual PowerPoint content could not be extracted.'
    }];
  }
}

module.exports = PowerPointService;
