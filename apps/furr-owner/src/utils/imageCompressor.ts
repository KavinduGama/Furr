import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Aggressively compresses and resizes photos locally on the device before upload.
 * Guarantees storage stays well below Firebase's 5GB free tier limit.
 */
export async function compressImage(
  uri: string,
  maxWidth: number = 800,
  quality: number = 0.6
): Promise<string> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.warn('Image compression failed, using original uri:', error);
    return uri;
  }
}
