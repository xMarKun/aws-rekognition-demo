import 'server-only';
import { Rekognition } from '@aws-sdk/client-rekognition';

export const supportedMimeTypes = ['image/jpeg', 'image/png'];
export const maxFileSize = 5 * 1024 * 1024; // 5MB

const rekognitionClient = new Rekognition({
  region: 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export default rekognitionClient;
