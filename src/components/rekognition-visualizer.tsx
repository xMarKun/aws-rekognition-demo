import Image from 'next/image';
import { BoundingBox, Landmark } from '@aws-sdk/client-rekognition';
import clsx from 'clsx';

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

type RekognitionVisualizerProps = {
  image: { src: string; width: number; height: number };
  faceDetails?: { boundingBox?: BoundingBox; landmarks?: Landmark[]; isMatch?: boolean }[];
};

export default function RekognitionVisualizer({ image, faceDetails }: RekognitionVisualizerProps) {
  return (
    <div className="relative w-fit h-fit mx-auto">
      <Image
        src={image.src}
        alt=""
        width={image.width}
        height={image.height}
        className="max-h-[calc(100dvh_/_1.5)] w-auto pointer-events-none"
      />
      {faceDetails?.map(({ boundingBox, landmarks, isMatch = true }, index) => {
        const { faceTop, faceLeft, faceWidth, faceHeight } = calcFaceBounding(boundingBox || {});
        return (
          <div key={faceTop + faceLeft + faceWidth + faceHeight} className="absolute inset-0 pointer-events-none">
            <div
              className={clsx(
                'absolute border peer pointer-events-auto',
                isMatch ? 'border-green-400' : 'border-red-500'
              )}
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
            {landmarks?.map(({ Type, ...landmark }) => {
              const { x, y } = calcLandmark(landmark);
              return (
                <div
                  key={Type}
                  className={clsx(
                    'absolute w-[1px] h-[1px] sm:w-0.5 sm:h-0.5 rounded-full',
                    isMatch ? 'bg-green-400' : 'bg-red-500'
                  )}
                  style={{ top: `${y}%`, left: `${x}%` }}
                ></div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
