'use client';
import { useRef, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { UploadIcon } from '@radix-ui/react-icons';

const mimeToExtension = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
};
type MimeType = keyof typeof mimeToExtension;

type DropzoneProps = {
  onDrop: (files: File[]) => void;
  accept?: MimeType[]; // デフォルト: ['image/png', 'image/jpeg']
  multiple?: boolean; // デフォルト: false
  maxFileSize?: number; // デフォルト: 4.5MB
  disabled?: boolean;
};

export default function Dropzone({
  onDrop,
  accept = ['image/png', 'image/jpeg'],
  multiple = false,
  maxFileSize = 4.5,
  disabled = false,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]) => {
    if (!multiple && files.length > 1) {
      toast.error('複数のファイルを選択することはできません。1つのファイルを選択してください。');
      return [];
    }
    let hasUnsupportedTypeError = false;
    let hasTooLargeFileSizeError = false;
    const validFiles = files.filter((file) => {
      if (!accept.includes(file.type as MimeType)) {
        hasUnsupportedTypeError = true;
        return false;
      }
      if (file.size > maxFileSize * 1024 * 1024) {
        hasTooLargeFileSizeError = true;
        return false;
      }
      return true;
    });
    if (hasUnsupportedTypeError) toast.error(`サポートされている形式のファイルを選択してください。`);
    if (hasTooLargeFileSizeError)
      toast.error(`ファイルサイズが大きすぎます。ファイルサイズの上限は${maxFileSize}MBです。`);
    return validFiles;
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    setIsDragging(false);
    onDrop(validateFiles(Array.from(event.dataTransfer.files)));
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onDrop(validateFiles(Array.from(event.target.files || [])));
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={clsx(
        'border border-dashed rounded-lg flex flex-col items-center gap-4 py-10 px-4 cursor-pointer',
        disabled ? 'opacity-50 pointer-events-none' : ['hover:bg-accent transition-colors', isDragging && 'bg-accent']
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleDropzoneClick}
      tabIndex={0}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handleDropzoneClick()}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        multiple={multiple}
        accept={accept.join(',')}
        className="hidden"
        aria-label="ファイルを選択"
      />
      <UploadIcon className="text-muted-foreground w-12 h-12" />
      <div className="text-sm text-muted-foreground text-center space-y-2">
        <p>
          ファイルをドラッグ&ドロップするか、<span className="inline-block">クリックしてファイルを選択</span>
        </p>
        <p>サポートされているファイル形式: {accept.map((mime) => mimeToExtension[mime]).join(', ')}</p>
        <p>ファイルサイズの上限: {maxFileSize}MB</p>
      </div>
    </div>
  );
}
