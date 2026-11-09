import React from 'react';
import { Text as NativeText, TextInput as NativeTextInput } from 'react-native';
import { useEquipTrack } from '@/context/EquipTrackContext';

export function AppText({ children, ...props }) {
  const { translateText } = useEquipTrack();
  const translatedChildren = React.Children.map(children, (child) =>
    typeof child === 'string' ? translateText(child) : child
  );

  return <NativeText {...props}>{translatedChildren}</NativeText>;
}

export function AppTextInput({ placeholder, ...props }) {
  const { translateText } = useEquipTrack();
  const translatedPlaceholder = translateText(placeholder);

  return <NativeTextInput {...props} placeholder={translatedPlaceholder} />;
}
