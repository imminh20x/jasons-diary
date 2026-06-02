const UNSPLASH_HOST = 'images.unsplash.com';

export function getOptimizedCoverImage(url: string, width = 800): string {
  if (url.startsWith('data:') || !url.includes(UNSPLASH_HOST)) {
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('q', '75');
    parsed.searchParams.set('w', String(width));
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.FileReader || !window.HTMLCanvasElement) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const outputFormat = 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], newName, {
              type: outputFormat,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputFormat,
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
