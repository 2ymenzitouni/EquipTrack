import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { AppText as Text } from '@/components/ConfigurableText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useEquipTrack } from '@/context/EquipTrackContext';
import { Spacing, Radius } from '@/constants/theme';

export function HeaderBar() {
  const { colors, unreadNotificationCount, notifications, markNotificationsRead } =
    useEquipTrack();
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenNotifications = () => {
    setModalVisible(true);
    markNotificationsRead();
  };

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.headerBackground }}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.headerBackground,
              borderBottomColor: colors.outlineVariant,
            },
          ]}>
          {/* Logo & Brand Name */}
          <View style={styles.brandContainer}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: colors.surfaceContainerLow },
              ]}>
              <MaterialIcons name="school" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: colors.primary }]}>
                EquipTrack
              </Text>
              <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                Gestion Campus & RFID
              </Text>
            </View>
          </View>

          {/* Action Icons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              accessibilityLabel="Notifications"
              style={[styles.actionButton, { backgroundColor: colors.surfaceContainerLow }]}
              onPress={handleOpenNotifications}
              activeOpacity={0.7}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.textSecondary}
              />
              {unreadNotificationCount > 0 && (
                <View
                  style={[
                    styles.notificationBadge,
                    { backgroundColor: colors.error, borderColor: colors.headerBackground },
                  ]}>
                  <Text style={styles.notificationCountText}>
                    {unreadNotificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Notifications Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}>
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitle}>
                <Ionicons
                  name="notifications"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.modalTitleText, { color: colors.text }]}>
                  Alertes & Notifications
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {notifications.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.notificationItem,
                    {
                      backgroundColor:
                        item.type === 'alert'
                          ? colors.errorContainer
                          : colors.surfaceContainerLow,
                      borderColor:
                        item.type === 'alert'
                          ? colors.error
                          : colors.outlineVariant,
                    },
                  ]}>
                  <View style={styles.notificationItemHeader}>
                    <Ionicons
                      name={
                        item.type === 'alert'
                          ? 'warning'
                          : item.type === 'success'
                          ? 'checkmark-circle'
                          : 'information-circle'
                      }
                      size={18}
                      color={
                        item.type === 'alert'
                          ? colors.error
                          : item.type === 'success'
                          ? colors.success
                          : colors.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.notificationItemTitle,
                        {
                          color:
                            item.type === 'alert'
                              ? colors.onErrorContainer
                              : colors.text,
                        },
                      ]}>
                      {item.title}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.notificationItemMessage,
                      { color: colors.textSecondary },
                    ]}>
                    {item.message}
                  </Text>
                  <Text
                    style={[
                      styles.notificationItemTime,
                      { color: colors.outline },
                    ]}>
                    {item.time}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.modalDoneButton,
                { backgroundColor: colors.primaryContainer },
              ]}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalDoneText}>Fermer</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 13,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    paddingHorizontal: 2,
  },
  notificationCountText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.four,
    elevation: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  modalHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: Spacing.one,
  },
  modalScroll: {
    marginBottom: Spacing.three,
  },
  notificationItem: {
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  notificationItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: 4,
  },
  notificationItemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  notificationItemMessage: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  notificationItemTime: {
    fontSize: 10,
    fontWeight: '500',
  },
  modalDoneButton: {
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
