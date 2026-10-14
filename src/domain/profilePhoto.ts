const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function prepareProfilePhoto(file: File): Promise<string> {
  if (!allowed.has(file.type)) throw new Error('Choose a JPG, PNG, or WebP image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Choose an image smaller than 5 MB.');
  let image: ImageBitmap;
  try { image = await createImageBitmap(file); }
  catch { throw new Error('This image could not be opened. Choose another photo.'); }
  try {
    if (!image.width || !image.height || image.width > 10000 || image.height > 10000) throw new Error('This image is too large to use as a profile photo.');
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare the photo.');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, 256, 256);
    const side = Math.min(image.width, image.height);
    context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 256, 256);
    const result = canvas.toDataURL('image/jpeg', 0.84);
    if (result.length > 500000) throw new Error('The photo is too large to save. Choose another image.');
    return result;
  } finally { image.close(); }
}
