import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class ArmazenamentoServico {
  async upload(arquivo: Express.Multer.File, pasta = 'ime'): Promise<{ urlPublica: string; publicId: string }> {
    const isImage = arquivo.mimetype.startsWith('image/');
    const resourceType: 'image' | 'raw' = isImage ? 'image' : 'raw';

    const resultado = await cloudinary.uploader.upload(arquivo.path, {
      folder: `${process.env.CLOUDINARY_FOLDER || 'ime'}/${pasta}`,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      access_mode: 'public',
    });

    try { await fs.unlink(arquivo.path); } catch { /* silencioso */ }

    return { urlPublica: resultado.secure_url, publicId: resultado.public_id };
  }

  async deletar(publicId: string, tipo: 'image' | 'raw' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: tipo });
    } catch { /* silencioso */ }
  }
}
