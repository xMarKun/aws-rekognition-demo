import { NextRequest, NextResponse } from 'next/server';
import type { DetectFacesCommandInput } from '@aws-sdk/client-rekognition';

import rekognitionClient from '@/lib/rekognition-client';
import ErrorHandler from '@/lib/error-handler';

const supportedMimeTypes = ['image/jpeg', 'image/png'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    // ファイルが存在しなかったら
    if (!file) {
      return ErrorHandler.invalidParameterError();
    }
    // ファイル形式がサポートされていないものだったら
    if (!supportedMimeTypes.includes(file.type)) {
      return ErrorHandler.invalidImageFormatError();
    }
    // ファイルサイズが5MBより大きかったら
    if (file.size > 5 * 1024 * 1024) {
      return ErrorHandler.ImageTooLargeError();
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const params: DetectFacesCommandInput = {
      Image: { Bytes: buffer },
      Attributes: ['ALL'],
    };

    const result = await rekognitionClient.detectFaces(params);

    return NextResponse.json(result.FaceDetails);
  } catch (error) {
    console.error('エラー:', error);
    return ErrorHandler.internalServerError();
  }
}
