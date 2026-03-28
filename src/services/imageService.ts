// src/services/imageService.ts
import * as ImagePicker from 'expo-image-picker';
import { ImageAsset } from '../store/useAppStore';

export async function pickImageFromLibrary(): Promise<ImageAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];

  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
  };
}

export async function pickImageFromCamera(): Promise<ImageAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];

  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
  };
}