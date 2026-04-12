import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useTheme } from 'styled-components/native';

type AppAvatarProps = {
  imagePath?: string;
  name?: string;
  size: number;
};

function initialsFromName(name: string | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function normalizeImageUri(imagePath: string | undefined): string | undefined {
  if (!imagePath || imagePath === 'null') return undefined;

  try {
    const url = new URL(imagePath);
    const segments = url.pathname.split('/');
    const lastSegment = segments[segments.length - 1];

    if (url.hostname === 'api.dicebear.com' && lastSegment === 'svg') {
      segments[segments.length - 1] = 'png';
      url.pathname = segments.join('/');
      return url.toString();
    }
  } catch {
    return imagePath;
  }

  return imagePath;
}

export default function AppAvatar({ imagePath, name, size }: AppAvatarProps) {
  const theme = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const imageUri = normalizeImageUri(imagePath);
  const hasImage = !!imageUri && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  if (!hasImage) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.shape,
        }}
      >
        <Text
          style={{
            color: theme.colors.text_gray,
            fontFamily: theme.fonts.bold,
            fontSize: Math.max(10, size * 0.38),
          }}
        >
          {initialsFromName(name)}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      onError={() => setImageFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    />
  );
}
