import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function cropImageToBlob(imageSrc: string, pixelCrop: PixelCrop): Promise<Blob> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const outputSize = Math.min(pixelCrop.width, pixelCrop.height, 400);
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, outputSize, outputSize
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      0.9
    );
  });
}

interface CropModalProps {
  imageSrc: string;
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
}

export const CropModal: React.FC<CropModalProps> = ({ imageSrc, onCrop, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: unknown, pixels: PixelCrop) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await cropImageToBlob(imageSrc, croppedAreaPixels);
      onCrop(blob);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal isOpen onClose={onCancel} title="写真をトリミング">
      <div className="space-y-4">
        <div
          className="relative w-full rounded-xl overflow-hidden"
          style={{ height: 280 }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: '0.75rem' },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3">
          <ZoomOut className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-accent"
          />
          <ZoomIn className="w-4 h-4 text-white/30 flex-shrink-0" />
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onCancel}>
            キャンセル
          </Button>
          <Button
            variant="gold"
            className="flex-1"
            onClick={handleConfirm}
            loading={processing}
          >
            決定
          </Button>
        </div>
      </div>
    </Modal>
  );
};
