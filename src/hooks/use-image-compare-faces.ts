'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import type { CompareFacesCommandOutput } from '@aws-sdk/client-rekognition';

export default function useImageCompareFaces() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (files: File[]) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('source-file', files[0]);
    formData.append('target-file', files[1]);

    try {
      const response = await fetch('/api/image-compare-faces', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error();

      const result = (await response.json()) as CompareFacesCommandOutput;
      return result;
    } catch (error) {
      toast.error('予期せぬエラーが発生しました。しばらくしてから再度お試しください。');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, uploadFile };
}
