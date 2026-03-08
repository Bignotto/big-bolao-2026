import { Image } from 'react-native';

const FALLBACK_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';

type AppAvatarProps = {
  imagePath?: string;
  size: number;
};

export default function AppAvatar({ imagePath, size }: AppAvatarProps) {
  const image = !imagePath || imagePath === 'null' ? FALLBACK_IMAGE : imagePath;

  return (
    <Image
      source={{ uri: image }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    />
  );
}
