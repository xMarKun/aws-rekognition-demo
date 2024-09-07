import 'server-only';
import { Rekognition } from '@aws-sdk/client-rekognition';

const rekognitionClient = new Rekognition({
  region: 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export default rekognitionClient;
