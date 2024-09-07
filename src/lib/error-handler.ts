import 'server-only';
import { NextResponse } from 'next/server';

class ErrorHandler {
  static createError(type: string, message: string, status: number) {
    return NextResponse.json({ error: { type, message } }, { status });
  }

  static invalidParameterError() {
    return this.createError(
      'InvalidParameterException',
      '無効なパラメータが指定されました。パラメータを確認してください。',
      400
    );
  }

  static invalidImageFormatError() {
    return this.createError(
      'InvalidImageFormatException',
      '指定された画像形式はサポートされていません。JPEGおよびPNG形式を使用してください。',
      400
    );
  }

  static ImageTooLargeError() {
    return this.createError(
      'ImageTooLargeException',
      '指定された画像ファイルはサイズが大きすぎます。5MB以下のファイルを指定してください。',
      400
    );
  }

  static internalServerError() {
    return this.createError(
      'InternalServerError',
      '予期せぬエラーが発生しました。しばらくしてから再度お試しください。',
      500
    );
  }
}

export default ErrorHandler;
