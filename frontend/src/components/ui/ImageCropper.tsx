import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, makeAspectCrop, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';

interface ImageCropperProps {
  image: File;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
}

export function ImageCropper({ 
  image, 
  onCropComplete, 
  onCancel,
  maxWidth = 500,
  maxHeight = 500,
  aspectRatio = 1
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imgSrc, setImgSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load image on mount
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
    };
    reader.readAsDataURL(image);
  }, [image]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    // Create initial crop that fits within max dimensions while maintaining aspect ratio
    // Use percentage-based crop for better responsiveness
    const crop = makeAspectCrop(
      {
        unit: '%',
        width: 90, // Start with 90% of image width
      },
      aspectRatio,
      naturalWidth,
      naturalHeight
    );
    // Center the crop on the image
    setCrop(centerCrop(crop, naturalWidth, naturalHeight));
  }, [aspectRatio]);

  const getCroppedImg = useCallback(
    async (image: HTMLImageElement, crop: PixelCrop): Promise<File> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      // Calculate scale to fit max dimensions
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Calculate crop dimensions
      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;

      // Set canvas size to crop dimensions
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Draw cropped image
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Resize to max dimensions if needed
      let finalWidth = cropWidth;
      let finalHeight = cropHeight;

      if (finalWidth > maxWidth || finalHeight > maxHeight) {
        const ratio = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
        finalWidth = finalWidth * ratio;
        finalHeight = finalHeight * ratio;

        const resizedCanvas = document.createElement('canvas');
        const resizedCtx = resizedCanvas.getContext('2d');
        if (!resizedCtx) throw new Error('No 2d context');

        resizedCanvas.width = finalWidth;
        resizedCanvas.height = finalHeight;

        resizedCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight);
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        ctx.drawImage(resizedCanvas, 0, 0);
      }

      return new Promise<File>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }
            const file = new File([blob], image.name, {
              type: 'image/png',
              lastModified: Date.now(),
            });
            resolve(file);
          },
          'image/png',
          0.95
        );
      });
    },
    [maxWidth, maxHeight]
  );

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedFile);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop and Resize Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {imgSrc && (
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                minWidth={50}
                minHeight={50}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{ maxHeight: '70vh', maxWidth: '100%' }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
          )}
          <p className="text-sm text-[#6B635B] text-center">
            Crop and center your image. Maximum size: {maxWidth}x{maxHeight}px
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleCropComplete} disabled={!completedCrop || isProcessing}>
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

