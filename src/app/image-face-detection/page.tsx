'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2Icon } from 'lucide-react';
import { ChevronDownIcon, Cross1Icon, ImageIcon } from '@radix-ui/react-icons';
import type { BoundingBox, EmotionName, FaceDetail, Landmark } from '@aws-sdk/client-rekognition';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import ImagePreviewDialog from '@/components/image-preview-dialog';
import Dropzone from '@/components/dropzone';
import useImageFaceDetection from '@/hooks/use-image-face-detection';

const emotionLabels: { [key in EmotionName]: string } = {
  HAPPY: '喜び',
  SAD: '悲しみ',
  ANGRY: '怒り',
  DISGUSTED: '嫌悪',
  CONFUSED: '混乱',
  SURPRISED: '驚き',
  CALM: '冷静',
  FEAR: '恐れ',
  UNKNOWN: '不明',
};

export default function Page() {
  const { isUploading, uploadFile } = useImageFaceDetection();
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [faceDetails, setFaceDetails] = useState<FaceDetail[] | null>(null);

  const handleRemoveFile = () => {
    imageUrl && URL.revokeObjectURL(imageUrl);
    setImage(null);
    setImageUrl(null);
    setImageSize({ width: 0, height: 0 });
  };

  const handleDrop = (files: File[]) => {
    if (files.length < 1) return;
    setImage(files[0]);
    imageUrl && URL.revokeObjectURL(imageUrl);
    const url = URL.createObjectURL(files[0]);
    setImageUrl(url);
    const img = new window.Image();
    img.onload = () => setImageSize({ width: img.width, height: img.height });
    img.src = url;
  };

  const handleUpload = async () => {
    if (!image) return;
    const result = await uploadFile(image);
    if (!result) return;
    setFaceDetails(result);
  };

  useEffect(() => {
    return () => {
      imageUrl && URL.revokeObjectURL(imageUrl);
    };
  }, []);

  const reset = () => {
    handleRemoveFile();
    setFaceDetails(null);
  };

  const calcFaceBounding = (boundingBox: BoundingBox) => {
    const faceTop = (boundingBox.Top || 0) * 100,
      faceLeft = (boundingBox.Left || 0) * 100,
      faceWidth = (boundingBox.Width || 0) * 100,
      faceHeight = (boundingBox.Height || 0) * 100;
    return { faceTop, faceLeft, faceWidth, faceHeight };
  };

  const calcLandmark = (landmark: Landmark) => {
    const x = (landmark.X || 0) * 100,
      y = (landmark.Y || 0) * 100;
    return { x, y };
  };

  return (
    <>
      <h1 className="text-lg font-bold">イメージ内の顔を検知</h1>
      {faceDetails ? (
        image &&
        imageUrl && (
          <Card className="mt-5">
            <CardHeader>
              <CardTitle>検出結果</CardTitle>
              <CardDescription>{image.name} の画像で検出された情報を表示しています。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-fit h-fit mx-auto">
                <Image
                  src={imageUrl}
                  alt=""
                  width={imageSize.width}
                  height={imageSize.height}
                  className="max-h-[calc(100dvh_/_1.5)] w-auto pointer-events-none"
                />
                {faceDetails.map(({ BoundingBox, Landmarks }, index) => {
                  const { faceTop, faceLeft, faceWidth, faceHeight } = calcFaceBounding(BoundingBox || {});
                  return (
                    <div
                      key={faceTop + faceLeft + faceWidth + faceHeight}
                      className="absolute inset-0 pointer-events-none"
                    >
                      <div
                        className="absolute border border-green-400 peer pointer-events-auto"
                        style={{
                          top: `${faceTop}%`,
                          left: `${faceLeft}%`,
                          width: `${faceWidth}%`,
                          height: `${faceHeight}%`,
                        }}
                      ></div>
                      <div
                        className="absolute text-xs rounded-full bg-secondary px-1 opacity-30 hover:opacity-100 hover:z-10 peer-hover:opacity-100 peer-hover:z-10 pointer-events-auto"
                        style={{ top: `calc(${faceTop}% - 20px)`, left: `${faceLeft}%` }}
                      >
                        Person{`00${index + 1}`.slice(-3)}
                      </div>
                      {Landmarks?.map(({ Type, ...landmark }) => {
                        const { x, y } = calcLandmark(landmark);
                        return (
                          <div
                            key={Type}
                            className="absolute w-[1px] h-[1px] sm:w-0.5 sm:h-0.5 rounded-full bg-green-400"
                            style={{ top: `${y}%`, left: `${x}%` }}
                          ></div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-3">
                {faceDetails.map(
                  (
                    {
                      Confidence,
                      AgeRange,
                      Beard,
                      Mustache,
                      Gender,
                      Eyeglasses,
                      Sunglasses,
                      FaceOccluded,
                      EyesOpen,
                      MouthOpen,
                      Smile,
                      Emotions,
                    },
                    index
                  ) => (
                    <Collapsible key={(Confidence || 0) + index}>
                      <CollapsibleTrigger asChild>
                        <Button variant="secondary" className="w-full justify-between">
                          Person{`00${index + 1}`.slice(-3)}
                          <ChevronDownIcon />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>項目名</TableHead>
                              <TableHead>値</TableHead>
                              <TableHead>信頼度</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>顔全体の信頼度</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>{Math.floor((Confidence || 0) * 10) / 10}%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>年齢</TableCell>
                              <TableCell>
                                {AgeRange?.Low || '?'} ~ {AgeRange?.High || '?'}
                              </TableCell>
                              <TableCell>-</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>性別</TableCell>
                              <TableCell>
                                {typeof Gender?.Value === 'undefined' ? '-' : Gender.Value === 'Male' ? '男性' : '女性'}
                              </TableCell>
                              <TableCell>
                                {typeof Gender?.Confidence === 'undefined'
                                  ? '-'
                                  : Math.floor(Gender.Confidence * 10) / 10 + '%'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>髭の有無</TableCell>
                              <TableCell>
                                {typeof Beard?.Value === 'undefined' ? '-' : Beard.Value ? '有' : '無'}
                              </TableCell>
                              <TableCell>
                                {typeof Beard?.Confidence === 'undefined'
                                  ? '-'
                                  : Math.floor(Beard.Confidence * 10) / 10 + '%'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>口髭の有無</TableCell>
                              <TableCell>
                                {typeof Mustache?.Value === 'undefined' ? '-' : Mustache.Value ? '有' : '無'}
                              </TableCell>
                              <TableCell>
                                {typeof Mustache?.Confidence === 'undefined'
                                  ? '-'
                                  : Math.floor(Mustache.Confidence * 10) / 10 + '%'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>メガネ着用の有無</TableCell>
                              <TableCell>
                                {typeof Eyeglasses?.Value === 'undefined' ? '-' : Eyeglasses.Value ? '有' : '無'}
                              </TableCell>
                              <TableCell>
                                {typeof Eyeglasses?.Confidence === 'undefined'
                                  ? '-'
                                  : Math.floor(Eyeglasses.Confidence * 10) / 10 + '%'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>サングラス着用の有無</TableCell>
                              <TableCell>
                                {typeof Sunglasses?.Value === 'undefined' ? '-' : Sunglasses.Value ? '有' : '無'}
                              </TableCell>
                              <TableCell>
                                {typeof Sunglasses?.Confidence === 'undefined'
                                  ? '-'
                                  : Math.floor(Sunglasses.Confidence * 10) / 10 + '%'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>顔が遮られている</TableCell>
                              <TableCell>
                                {typeof FaceOccluded?.Value === 'undefined'
                                  ? '-'
                                  : FaceOccluded.Value
                                  ? 'はい'
                                  : 'いいえ'}
                              </TableCell>
                              <TableCell>
                                {typeof FaceOccluded?.Confidence === 'undefined'
                                  ? '-'
                                  : Math.floor(FaceOccluded.Confidence * 10) / 10 + '%'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>目が開いている</TableCell>
                              <TableCell>
                                {typeof EyesOpen?.Value === 'undefined' ? '-' : EyesOpen.Value ? 'はい' : 'いいえ'}
                              </TableCell>
                              <TableCell>
                                {typeof EyesOpen?.Confidence === 'undefined'
                                  ? '-'
                                  : Math.floor(EyesOpen.Confidence * 10) / 10 + '%'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>口が開いている</TableCell>
                              <TableCell>
                                {typeof MouthOpen?.Value === 'undefined' ? '-' : MouthOpen.Value ? 'はい' : 'いいえ'}
                              </TableCell>
                              <TableCell>
                                {typeof MouthOpen?.Confidence === 'undefined'
                                  ? '-'
                                  : Math.floor(MouthOpen.Confidence * 10) / 10 + '%'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>笑顔</TableCell>
                              <TableCell>
                                {typeof Smile?.Value === 'undefined' ? '-' : Smile.Value ? 'はい' : 'いいえ'}
                              </TableCell>
                              <TableCell>
                                {typeof Smile?.Confidence === 'undefined'
                                  ? '-'
                                  : Math.floor(Smile.Confidence * 10) / 10 + '%'}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <div className="border p-3 rounded-lg mt-2">
                          <p className="font-bold mb-2">感情</p>
                          <ul>
                            {Emotions?.map(({ Type, Confidence }) => (
                              <li className="flex items-center text-sm">
                                <p className="w-16 shrink-0">{emotionLabels[Type || 'UNKNOWN']}</p>
                                <Progress value={Confidence} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t py-4">
              <Button onClick={reset}>別の画像で試す</Button>
            </CardFooter>
          </Card>
        )
      ) : (
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>画像をアップロード</CardTitle>
            <CardDescription>顔を検知したい画像をアップロードしてください。</CardDescription>
          </CardHeader>
          <CardContent>
            <Dropzone onDrop={handleDrop} disabled={isUploading} />
            {image && imageUrl && (
              <div className="mt-6">
                <p className="text-sm font-medium">選択されたファイル：</p>
                <div className="mt-2 flex items-center gap-2">
                  <ImagePreviewDialog
                    src={imageUrl}
                    alt={`${image.name}のプレビュー`}
                    width={imageSize.width}
                    height={imageSize.height}
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
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                  >
                    <Cross1Icon />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleUpload} disabled={!image || isUploading}>
              {isUploading && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
              顔を検知する
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
