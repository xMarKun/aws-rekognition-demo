import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type ImagePreviewDialogProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export default function ImagePreviewDialog({
  src,
  alt,
  width,
  height,
  children,
  title,
  description,
}: ImagePreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="overflow-auto max-h-full">
        <DialogHeader>
          <DialogTitle>{title || 'プレビュー'}</DialogTitle>
          <DialogDescription>{description || '画像をプレビューします。'}</DialogDescription>
        </DialogHeader>
        <Image src={src} alt={alt} width={width} height={height} />
      </DialogContent>
    </Dialog>
  );
}
