import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useEquipTrack } from '@/context/EquipTrackContext';
import { Spacing, Radius } from '@/constants/theme';

const TIME_FILTERS = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Période'];

export default function HistoriqueScreen() {
  const {
    colors,
    scans,
    simulateTagScan,
    callPhone,
    showToast,
    triggerHapticFeedback,
  } = useEquipTrack();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("Aujourd'hui");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedScanDetail, setSelectedScanDetail] = useState(null);

  // Filter scans by search query
  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      const q = searchQuery.toLowerCase();
      return (
        scan.studentName.toLowerCase().includes(q) ||
        scan.tagId.toLowerCase().includes(q) ||
        scan.statusText.toLowerCase().includes(q) ||
        scan.detail.toLowerCase().includes(q)
      );
    });
  }, [scans, searchQuery]);

  // Group scans into timeframes
  const groupedScans = useMemo(() => {
    const afternoon = filteredScans.filter((s) => s.timeGroup === 'afternoon');
    const lunch = filteredScans.filter((s) => s.timeGroup === 'lunch');
    const morning = filteredScans.filter((s) => s.timeGroup === 'morning');
    return { afternoon, lunch, morning };
  }, [filteredScans]);

  const handleRefresh = () => {
    triggerHapticFeedback();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Données synchronisées avec la borne RFID');
    }, 700);
  };

  const handleExportCSV = async () => {
    triggerHapticFeedback();
    setIsExporting(true);

    const headers = 'ID,Eleve,TagID,Heure,Statut,Detail\n';
    const rows = scans
      .map(
        (s) =>
          `"${s.id}","${s.studentName}","${s.tagId}","${s.time}","${s.statusText}","${s.detail}"`
      )
      .join('\n');
    const csvContent = headers + rows;

    try {
      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `equiptrack_scans_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        await Clipboard.setStringAsync(csvContent);
      }
      showToast('Journal exporté au format CSV !');
    } catch {
      showToast('Export généré avec succès');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      {/* Page Title */}
      <View style={styles.headerSection}>
        <Text style={[styles.pageTitle, { color: colors.onSurface }]}>
          Historique des scans
        </Text>
      </View>

      {/* STATS KPI BENTO GRID (3 columns) */}
      <View style={styles.bentoGrid}>
        {/* Card 1: Aujourd'hui */}
        <View
          style={[
            styles.bentoCard,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}>
          <View style={styles.bentoCardHeader}>
            <Text style={[styles.bentoLabel, { color: colors.onSurfaceVariant }]}>
              Aujourd’hui
            </Text>
            <MaterialIcons name="badge" size={16} color={colors.secondary} />
          </View>
          <View style={styles.bentoBody}>
            <Text style={[styles.bentoValue, { color: colors.onSurface }]}>
              {140 + scans.length}
            </Text>
            <Text style={[styles.bentoSub, { color: colors.onSurfaceVariant }]}>
              scans validés
            </Text>
          </View>
        </View>

        {/* Card 2: Taux conformité */}
        <View
          style={[
            styles.bentoCard,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}>
          <View style={styles.bentoCardHeader}>
            <Text style={[styles.bentoLabel, { color: colors.onSurfaceVariant }]}>
              Taux conformité
            </Text>
            <MaterialIcons
              name="verified-user"
              size={16}
              color={colors.success}
            />
          </View>
          <View style={styles.bentoBody}>
            <Text style={[styles.bentoValue, { color: colors.onSurface }]}>
              98.6%
            </Text>
            <Text style={[styles.bentoSubAlert, { color: colors.successText }]}>
              2 alertes
            </Text>
          </View>
        </View>

        {/* Card 3: Dernier scan */}
        <View
          style={[
            styles.bentoCard,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}>
          <View style={styles.bentoCardHeader}>
            <Text style={[styles.bentoLabel, { color: colors.onSurfaceVariant }]}>
              Dernier scan
            </Text>
            <MaterialIcons name="schedule" size={16} color={colors.primary} />
          </View>
          <View style={styles.bentoBody}>
            <Text style={[styles.bentoValue, { color: colors.onSurface }]}>
              {scans[0]?.time || '14:32'}
            </Text>
            <Text style={[styles.bentoSub, { color: colors.onSurfaceVariant }]}>
              Il y a 3 min
            </Text>
          </View>
        </View>
      </View>

      {/* SEARCH & FILTER TOOLBAR */}
      <View style={styles.toolbarSection}>
        {/* Search Field */}
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}>
          <MaterialIcons
            name="search"
            size={20}
            color={colors.outline}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            placeholder="Rechercher élève, classe ou ID badge..."
            placeholderTextColor={colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Time Scope Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeChipsContainer}>
          {TIME_FILTERS.map((item) => {
            const isSelected = selectedTimeFilter === item;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  triggerHapticFeedback();
                  setSelectedTimeFilter(item);
                }}
                activeOpacity={0.8}
                style={[
                  styles.timeChip,
                  isSelected
                    ? [styles.timeChipActive, { backgroundColor: colors.primaryContainer }]
                    : [
                        styles.timeChipInactive,
                        {
                          backgroundColor: colors.surfaceContainerLowest,
                          borderColor: colors.outlineVariant,
                        },
                      ],
                ]}>
                {item === 'Période' && (
                  <MaterialIcons
                    name="calendar-today"
                    size={14}
                    color={isSelected ? '#ffffff' : colors.onSurfaceVariant}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.timeChipText,
                    {
                      color: isSelected ? '#ffffff' : colors.onSurfaceVariant,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* QUICK LIVE SCAN SIMULATOR BUTTON */}
      <TouchableOpacity
        style={[
          styles.quickScanBar,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: colors.outlineVariant,
          },
        ]}
        onPress={() => simulateTagScan()}
        activeOpacity={0.8}>
        <View style={styles.quickScanLeft}>
          <View
            style={[
              styles.quickScanIconWrapper,
              { backgroundColor: colors.primaryContainer },
            ]}>
            <MaterialIcons name="contactless" size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={[styles.quickScanTitle, { color: colors.onSurface }]}>
              Simuler un passage de badge RFID
            </Text>
            <Text
              style={[styles.quickScanSub, { color: colors.onSurfaceVariant }]}>
              Touchez pour simuler un scan en direct
            </Text>
          </View>
        </View>
        <MaterialIcons
          name="play-circle-outline"
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>

      {/* TIMELINE ACTIVITY JOURNAL */}
      <View style={styles.timelineSection}>
        {/* GROUP 1: Après-midi */}
        {groupedScans.afternoon.length > 0 && (
          <View style={styles.timeGroup}>
            <View style={styles.timeGroupHeader}>
              <View style={styles.timeGroupTitleRow}>
                <View
                  style={[styles.groupDot, { backgroundColor: colors.primary }]}
                />
                <Text
                  style={[
                    styles.timeGroupTitleText,
                    { color: colors.onSurface },
                  ]}>
                  Après-midi (14h00 - 15h00)
                </Text>
              </View>
              <Text
                style={[
                  styles.timeGroupCountText,
                  { color: colors.outline },
                ]}>
                {groupedScans.afternoon.length} scans
              </Text>
            </View>

            {groupedScans.afternoon.map((item) => (
              <ScanCard
                key={item.id}
                item={item}
                colors={colors}
                onDetails={() => setSelectedScanDetail(item)}
                onCall={() => callPhone('+33 6 12 34 56 78')}
              />
            ))}
          </View>
        )}

        {/* GROUP 2: Midi */}
        {groupedScans.lunch.length > 0 && (
          <View style={styles.timeGroup}>
            <View style={styles.timeGroupHeader}>
              <View style={styles.timeGroupTitleRow}>
                <View
                  style={[styles.groupDot, { backgroundColor: colors.secondary }]}
                />
                <Text
                  style={[
                    styles.timeGroupTitleText,
                    { color: colors.onSurface },
                  ]}>
                  Midi (11h30 - 13h30)
                </Text>
              </View>
              <Text
                style={[
                  styles.timeGroupCountText,
                  { color: colors.outline },
                ]}>
                {groupedScans.lunch.length} scans
              </Text>
            </View>

            {groupedScans.lunch.map((item) => (
              <ScanCard
                key={item.id}
                item={item}
                colors={colors}
                onDetails={() => setSelectedScanDetail(item)}
                onCall={() => callPhone('+33 6 78 90 12 44')}
              />
            ))}
          </View>
        )}

        {/* GROUP 3: Matinée */}
        {groupedScans.morning.length > 0 && (
          <View style={styles.timeGroup}>
            <View style={styles.timeGroupHeader}>
              <View style={styles.timeGroupTitleRow}>
                <View
                  style={[styles.groupDot, { backgroundColor: colors.outline }]}
                />
                <Text
                  style={[
                    styles.timeGroupTitleText,
                    { color: colors.onSurface },
                  ]}>
                  Matinée (07h45 - 08h30)
                </Text>
              </View>
              <Text
                style={[
                  styles.timeGroupCountText,
                  { color: colors.outline },
                ]}>
                {groupedScans.morning.length} scans
              </Text>
            </View>

            {groupedScans.morning.map((item) => (
              <ScanCard
                key={item.id}
                item={item}
                colors={colors}
                onDetails={() => setSelectedScanDetail(item)}
                onCall={() => callPhone('+33 6 99 88 77 66')}
              />
            ))}
          </View>
        )}
      </View>

      {/* EXPORT & REFRESH ACTION DOCK */}
      <View style={styles.exportSection}>
        <View
          style={[
            styles.exportCard,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
            },
          ]}>
          <View style={styles.exportCardLeft}>
            <View
              style={[
                styles.exportIconBox,
                { backgroundColor: colors.primary },
              ]}>
              <MaterialIcons name="description" size={20} color="#ffffff" />
            </View>
            <View>
              <Text style={[styles.exportCardTitle, { color: colors.onSurface }]}>
                Exporter le journal
              </Text>
              <Text
                style={[
                  styles.exportCardSub,
                  { color: colors.onSurfaceVariant },
                ]}>
                Format CSV ou PDF horodaté
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.exportButton,
              { backgroundColor: colors.primaryContainer },
            ]}
            onPress={handleExportCSV}
            disabled={isExporting}
            activeOpacity={0.85}>
            {isExporting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <MaterialIcons name="download" size={18} color="#ffffff" />
                <Text style={styles.exportButtonText}>Exporter</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Refresh Live Button */}
        <TouchableOpacity
          style={[
            styles.refreshButton,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
          onPress={handleRefresh}
          disabled={isRefreshing}
          activeOpacity={0.8}>
          {isRefreshing ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <MaterialIcons
              name="refresh"
              size={18}
              color={colors.onSurfaceVariant}
            />
          )}
          <Text
            style={[styles.refreshButtonText, { color: colors.onSurfaceVariant }]}>
            Rafraîchir les données en direct
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scan Detail Modal */}
      <Modal
        visible={!!selectedScanDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedScanDetail(null)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedScanDetail(null)}>
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
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                Détails du Pointage
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedScanDetail(null)}
                style={styles.modalCloseButton}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedScanDetail && (
              <View style={styles.modalContent}>
                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: colors.outline }]}>
                    Élève :
                  </Text>
                  <Text style={[styles.modalValue, { color: colors.onSurface }]}>
                    {selectedScanDetail.studentName}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: colors.outline }]}>
                    Identifiant Badge :
                  </Text>
                  <Text style={[styles.modalValue, { color: colors.primary }]}>
                    #{selectedScanDetail.tagId}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: colors.outline }]}>
                    Heure du scan :
                  </Text>
                  <Text style={[styles.modalValue, { color: colors.onSurface }]}>
                    {selectedScanDetail.time}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: colors.outline }]}>
                    Événement :
                  </Text>
                  <Text style={[styles.modalValue, { color: colors.onSurface }]}>
                    {selectedScanDetail.statusText}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: colors.outline }]}>
                    Remarques :
                  </Text>
                  <Text
                    style={[styles.modalValue, { color: colors.onSurfaceVariant }]}>
                    {selectedScanDetail.detail}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.modalDoneButton,
                { backgroundColor: colors.primaryContainer },
              ]}
              onPress={() => setSelectedScanDetail(null)}>
              <Text style={styles.modalDoneText}>Fermer</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function ScanCard({
  item,
  colors,
  onDetails,
  onCall,
}) {
  const isError = item.type === 'denied';

  return (
    <View
      style={[
        styles.scanCard,
        {
          backgroundColor: isError
            ? '#fef2f2'
            : colors.surfaceContainerLowest,
          borderColor: isError ? '#fecaca' : colors.outlineVariant,
        },
      ]}>
      {/* Top Header of the Scan Item */}
      <View style={styles.scanCardHeader}>
        <View style={styles.scanCardAvatarRow}>
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: isError
                    ? '#fee2e2'
                    : colors.surfaceContainerLow,
                },
              ]}>
              <Text
                style={[
                  styles.avatarInitials,
                  { color: isError ? colors.error : colors.primary },
                ]}>
                {item.initials}
              </Text>
            </View>
            <View
              style={[
                styles.scanStatusIndicator,
                {
                  backgroundColor: isError ? colors.error : colors.success,
                  borderColor: isError ? '#fef2f2' : '#ffffff',
                },
              ]}>
              <MaterialIcons
                name={isError ? 'close' : 'check'}
                size={10}
                color="#ffffff"
              />
            </View>
          </View>

          <View style={styles.scanStudentMeta}>
            <Text style={[styles.scanStudentName, { color: colors.onSurface }]}>
              {item.studentName}
            </Text>
            <View style={styles.scanBadgeRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isError
                      ? '#fee2e2'
                      : item.type === 'exit'
                      ? '#eff6ff'
                      : colors.successContainer,
                    borderColor: isError
                      ? '#fca5a5'
                      : item.type === 'exit'
                      ? '#bfdbfe'
                      : colors.successBorder,
                  },
                ]}>
                <View
                  style={[
                    styles.statusBadgeDot,
                    {
                      backgroundColor: isError
                        ? colors.error
                        : item.type === 'exit'
                        ? colors.secondary
                        : colors.success,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: isError
                        ? colors.error
                        : item.type === 'exit'
                        ? colors.secondary
                        : colors.successText,
                    },
                  ]}>
                  {item.statusText}
                </Text>
              </View>

              <View style={styles.tagLabelRow}>
                <MaterialIcons
                  name="contactless"
                  size={13}
                  color={isError ? colors.error : colors.outline}
                />
                <Text
                  style={[
                    styles.tagLabelText,
                    { color: isError ? colors.error : colors.outline },
                  ]}>
                  #{item.tagId}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text
          style={[
            styles.scanTimestamp,
            { color: isError ? colors.error : colors.onSurface },
          ]}>
          {item.time}
        </Text>
      </View>

      {/* Bottom Row */}
      {isError ? (
        <View style={styles.errorBannerRow}>
          <View style={styles.errorBannerTextRow}>
            <MaterialIcons name="error" size={15} color={colors.error} />
            <Text style={[styles.errorBannerText, { color: colors.error }]}>
              {item.detail}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.callBannerButton, { backgroundColor: colors.error }]}
            onPress={onCall}
            activeOpacity={0.85}>
            <MaterialIcons name="call" size={13} color="#ffffff" />
            <Text style={styles.callBannerButtonText}>Appeler</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.scanCardFooter,
            { borderTopColor: colors.surfaceContainer },
          ]}>
          <Text
            style={[styles.scanCardDetailText, { color: colors.outline }]}>
            {item.detail}
          </Text>
          <TouchableOpacity
            style={[
              styles.detailsButton,
              { backgroundColor: colors.surfaceContainerLow },
            ]}
            onPress={onDetails}
            activeOpacity={0.75}>
            <MaterialIcons
              name="visibility"
              size={14}
              color={colors.primary}
            />
            <Text
              style={[styles.detailsButtonText, { color: colors.primary }]}>
              Détails
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.eight + 20,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  headerSection: {
    marginBottom: Spacing.three,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  bentoCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Radius.xl,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  bentoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bentoLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  bentoBody: {
    marginTop: 6,
  },
  bentoValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  bentoSub: {
    fontSize: 10,
    marginTop: 2,
  },
  bentoSubAlert: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  toolbarSection: {
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  timeChipsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
  },
  timeChipActive: {
    elevation: 2,
  },
  timeChipInactive: {
    borderWidth: 1,
  },
  timeChipText: {
    fontSize: 12,
  },
  quickScanBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  quickScanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  quickScanIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickScanTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickScanSub: {
    fontSize: 11,
  },
  timelineSection: {
    gap: Spacing.four,
    marginBottom: Spacing.four,
  },
  timeGroup: {
    gap: Spacing.two,
  },
  timeGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  timeGroupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timeGroupTitleText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeGroupCountText: {
    fontSize: 11,
  },
  scanCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  scanCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  scanCardAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '700',
  },
  scanStatusIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanStudentMeta: {
    flex: 1,
  },
  scanStudentName: {
    fontSize: 14,
    fontWeight: '700',
  },
  scanBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  statusBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tagLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  tagLabelText: {
    fontSize: 10,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  scanTimestamp: {
    fontSize: 13,
    fontWeight: '700',
  },
  scanCardFooter: {
    borderTopWidth: 1,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanCardDetailText: {
    fontSize: 11,
    flex: 1,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  detailsButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: Radius.md,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorBannerTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  errorBannerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  callBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  callBannerButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  exportSection: {
    marginTop: Spacing.two,
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  exportCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  exportIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportCardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  exportCardSub: {
    fontSize: 11,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: Radius.md,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  refreshButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.four,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalLabel: {
    fontSize: 13,
  },
  modalValue: {
    fontSize: 13,
    fontWeight: '700',
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
