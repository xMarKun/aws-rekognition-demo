import { useState } from 'react';
import { toast } from 'sonner';
import type { FaceDetail } from '@aws-sdk/client-rekognition';

type UseImageFaceDetectionReturn = {
  isUploading: boolean;
  uploadFile: (file: File) => Promise<FaceDetail[] | false>;
};

export default function useImageFaceDetection(): UseImageFaceDetectionReturn {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/image-face-detection', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error();

      const result = (await response.json()) as FaceDetail[];
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
