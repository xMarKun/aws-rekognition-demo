import { NextRequest, NextResponse } from 'next/server';
import type { CompareFacesCommandInput } from '@aws-sdk/client-rekognition';

import rekognitionClient, { maxFileSize, supportedMimeTypes } from '@/lib/rekognition-client';
import ErrorHandler from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sourceFile = formData.get('source-file') as Blob;
    const targetFile = formData.get('target-file') as Blob;
    // ファイルが存在しなかったら
    if (!sourceFile || !targetFile) {
      return ErrorHandler.invalidParameterError();
    }
    // ファイル形式がサポートされていないものだったら
    if (!supportedMimeTypes.includes(sourceFile.type) || !supportedMimeTypes.includes(targetFile.type)) {
      return ErrorHandler.invalidImageFormatError();
    }
    // ファイルサイズが5MBより大きかったら
    if (sourceFile.size > maxFileSize || targetFile.size > maxFileSize) {
      return ErrorHandler.ImageTooLargeError();
    }

    const sourceArrayBuffer = await sourceFile.arrayBuffer();
    const targetArrayBuffer = await targetFile.arrayBuffer();
    const sourceBuffer = Buffer.from(sourceArrayBuffer);
    const targetBuffer = Buffer.from(targetArrayBuffer);
    const params: CompareFacesCommandInput = {
      SourceImage: { Bytes: sourceBuffer },
      TargetImage: { Bytes: targetBuffer },
      SimilarityThreshold: 80, // 信頼度が80以上の顔のみ「一致」する顔として返ります。それ以外は「一致しなかった」顔として返ります
    };

    const { $metadata, ...result } = await rekognitionClient.compareFaces(params);

    return NextResponse.json(result);
  } catch (error) {
    console.error('エラー:', error);
    return ErrorHandler.internalServerError();
  }
}
