import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text } from '@/components/ConfigurableText';
import { Ionicons } from '@expo/vector-icons';
import { useEquipTrack } from '@/context/EquipTrackContext';
import { Spacing, Radius } from '@/constants/theme';

export function Toast() {
  const { toastMessage, colors } = useEquipTrack();

  if (!toastMessage) return null;
  const message =
    typeof toastMessage === 'string' ? toastMessage : toastMessage.message;
  const isSuccess =
    typeof toastMessage === 'object' && toastMessage.variant === 'success';
  const isError =
    typeof toastMessage === 'object' && toastMessage.variant === 'error';

  return (
    <View style={styles.toastContainer} pointerEvents="none">
      <View
        style={[
          styles.toastBox,
          isSuccess && styles.successToastBox,
          isError && styles.errorToastBox,
          {
            backgroundColor: isSuccess || isError
              ? isSuccess
                ? colors.successContainer
                : colors.errorContainer
              : colors.surfaceContainerLowest === '#ffffff'
              ? '#1e293b'
              : '#334155',
            borderColor: isSuccess
              ? colors.successBorder
              : isError
              ? colors.error
              : colors.outlineVariant,
          },
        ]}>
        <Ionicons
          name={isError ? 'alert-circle' : 'checkmark-circle'}
          size={18}
          color={isSuccess ? colors.success : isError ? colors.error : '#89ceff'}
        />
        <Text
          style={[
            styles.toastText,
            isSuccess && { color: colors.successText },
            isError && { color: colors.onErrorContainer },
          ]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.xl,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    maxWidth: 380,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  successToastBox: {
    borderWidth: 1.5,
  },
  errorToastBox: {
    borderWidth: 1.5,
  },
});
