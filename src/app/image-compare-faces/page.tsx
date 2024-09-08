'use client';
import { useEffect, useRef, useState } from 'react';
import { Cross1Icon, ImageIcon } from '@radix-ui/react-icons';
import { Loader2Icon } from 'lucide-react';
import type { CompareFacesCommandOutput } from '@aws-sdk/client-rekognition';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Dropzone from '@/components/dropzone';
import ImagePreviewDialog from '@/components/image-preview-dialog';
import RekognitionVisualizer from '@/components/rekognition-visualizer';
import useImageCompareFaces from '@/hooks/use-image-compare-faces';

const imageTypes = ['ソースイメージ', 'ターゲットイメージ'];

export default function Page() {
  const { isUploading, uploadFile } = useImageCompareFaces();
  const [images, setImages] = useState<(File | null)[]>([null, null]);
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([null, null]);
  const [imageSizes, setImageSizes] = useState<({ width: number; height: number } | null)[]>([null, null]);
  const imageUrlsRef = useRef<(string | null)[]>([null, null]);
  const [result, setResult] = useState<Omit<CompareFacesCommandOutput, '$metadata'> | null>();

  const settedImages = images.filter((image) => image !== null);

  const changeImage = (index: number, newValue: File | null) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      newImages[index] = newValue;
      return newImages;
    });
  };

  const changeImageUrl = (index: number, newValue: string | null) => {
    setImageUrls((prevImageUrl) => {
      const newImageUrls = [...prevImageUrl];
      newImageUrls[index] = newValue;
      return newImageUrls;
    });
    imageUrlsRef.current[index] = newValue;
  };

  const changeImageSize = (index: number, newValue: { width: number; height: number } | null) => {
    setImageSizes((prevImageSizes) => {
      const newImageSizes = [...prevImageSizes];
      newImageSizes[index] = newValue ? { width: newValue.width, height: newValue.height } : newValue;
      return newImageSizes;
    });
  };

  const handleRemoveFile = (index: number) => {
    imageUrls[index] && URL.revokeObjectURL(imageUrls[index]);
    changeImage(index, null);
    changeImageUrl(index, null);
    changeImage(index, null);
    imageUrlsRef.current[index] = null;
  };

  const handleDrop = (index: number, files: File[]) => {
    if (files.length < 1) return;
    changeImage(index, files[0]);
    imageUrls[index] && URL.revokeObjectURL(imageUrls[index]);
    const url = URL.createObjectURL(files[0]);
    changeImageUrl(index, url);
    const img = new window.Image();
    img.onload = () => changeImageSize(index, { width: img.width, height: img.height });
    img.src = url;
  };

  const handleUpload = async () => {
    if (settedImages.length < 2) return;
    const result = await uploadFile(settedImages);
    if (!result) return;
    setResult(result);
  };

  useEffect(() => {
    const imageUrl = imageUrlsRef.current;
    return () => {
      imageUrl.forEach((imageUrl) => imageUrl && URL.revokeObjectURL(imageUrl));
    };
  }, []);

  const reset = () => {
    for (let i = 0; i < imageTypes.length; i++) {
      handleRemoveFile(i);
    }
    setResult(null);
  };

  return (
    <>
      <h1 className="text-lg font-bold">イメージ間の顔の比較</h1>
      {result ? (
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>比較結果</CardTitle>
            <CardDescription>ソースイメージとターゲットイメージを比較した結果を表示しています。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-sm mb-2">ソースイメージ</p>
                <RekognitionVisualizer
                  image={{
                    src: imageUrls?.[0] || '',
                    width: imageSizes[0]?.width || 0,
                    height: imageSizes[0]?.height || 0,
                  }}
                  faceDetails={[{ boundingBox: result.SourceImageFace?.BoundingBox }]}
                />
              </div>
              <div>
                <p className="text-sm mb-2">ターゲットイメージ</p>
                <RekognitionVisualizer
                  image={{
                    src: imageUrls?.[1] || '',
                    width: imageSizes[1]?.width || 0,
                    height: imageSizes[1]?.height || 0,
                  }}
                  faceDetails={[
                    ...(result.FaceMatches?.map(({ Face }) => ({
                      boundingBox: Face?.BoundingBox,
                      landmarks: Face?.Landmarks,
                    })) || []),
                    ...(result.UnmatchedFaces?.map(({ BoundingBox, Landmarks }) => ({
                      boundingBox: BoundingBox,
                      landmarks: Landmarks,
                      isMatch: false,
                    })) || []),
                  ]}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t py-4">
            <Button onClick={reset}>別の画像で試す</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>画像をアップロード</CardTitle>
            <CardDescription>顔を比較したい画像をアップロードしてください。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {imageTypes.map((type, index) => {
                const image = images[index];
                const imageUrl = imageUrls[index];
                const imageSize = imageSizes[index];
                return (
                  <div key={type}>
                    <p className="text-sm mb-2">{type}</p>
                    <Dropzone onDrop={(file) => handleDrop(index, file)} disabled={isUploading} />
                    {image && imageUrl && (
                      <div className="mt-6">
                        <p className="text-sm font-medium">選択されたファイル：</p>
                        <div className="mt-2 flex items-center gap-2">
                          <ImagePreviewDialog
                            src={imageUrl}
                            alt={`${image.name}のプレビュー`}
                            width={imageSize?.width || 0}
                            height={imageSize?.height || 0}
                            description={`${image.name} を表示しています。`}
                          >
                            <Button variant="outline" className="grow justify-start overflow-hidden">
                              <ImageIcon className="w-4 h-4 mr-2 shrink-0" />
                              <span className="truncate">{image.name}</span>
                            </Button>
                          </ImagePreviewDialog>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => handleRemoveFile(index)}
                            disabled={isUploading}
                          >
                            <Cross1Icon />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleUpload} disabled={settedImages.length < 2 || isUploading}>
              {isUploading && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
              顔を比較する
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
