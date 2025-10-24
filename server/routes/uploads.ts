import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

function extFromMime(mime?: string) {
  if (!mime) return '.jpg';
  if (mime.includes('png')) return '.png';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
  return '.jpg';
}

// Accepts JSON { data: 'data:<mime>;base64,<...>', filename?: string }
router.post('/', async (req, res) => {
  try {
    const { data, filename } = req.body || {};
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'Missing image data' });
    }
    const match = data.match(/^data:(.*?);base64,(.*)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid data URI format' });
    }
    const mime = match[1];
    const b64 = match[2];
    const buf = Buffer.from(b64, 'base64');
    const ext = extFromMime(mime);
    const ts = Date.now();
    const safeName = (filename?.replace(/[^a-zA-Z0-9-_]/g, '') || 'upload') + '-' + ts + ext;
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, safeName);
    await fs.promises.writeFile(filePath, buf);
    const base = `${req.protocol}://${req.get('host')}`;
    const url = `${base}/uploads/${safeName}`;
    res.status(201).json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;