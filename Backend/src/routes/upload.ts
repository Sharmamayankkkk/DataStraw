import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../supabaseClient';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload to Supabase Storage using the Backend's Service Role Key
    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Failed to upload to storage bucket' });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(fileName);

    return res.status(200).json({ publicUrl });
  } catch (error: any) {
    console.error('Error handling upload:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
