import { useState, type RefObject } from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

export function useShareRanking(cardRef: RefObject<View | null>) {
  const [sharing, setSharing] = useState(false);

  async function shareRanking() {
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartilhar ranking',
      });
    } finally {
      setSharing(false);
    }
  }

  async function saveToGallery(): Promise<boolean> {
    const { status } = await MediaLibrary.requestPermissionsAsync(true);
    if (status !== 'granted') return false;
    const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
    await MediaLibrary.saveToLibraryAsync(uri);
    return true;
  }

  return { shareRanking, saveToGallery, sharing };
}
