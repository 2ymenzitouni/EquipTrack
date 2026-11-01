import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useEquipTrack } from '@/context/EquipTrackContext';
import { Spacing, Radius } from '@/constants/theme';

const FILTER_CLASSES = [
  'Tous',
  'Terminale S2',
  'Première A',
  'Seconde 4',
  'Terminale ES1',
  '3ème B',
];

export default function RepertoireScreen() {
  const router = useRouter();
  const {
    colors,
    students,
    updateStudentStatus,
    deleteStudent,
    callPhone,
    triggerHapticFeedback,
  } = useEquipTrack();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Tous');
  const [activeMenuStudent, setActiveMenuStudent] = useState(null);

  // Filter students by query and selected class
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.classSection.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.tagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.equipment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass =
        selectedClass === 'Tous' ||
        student.classSection.toLowerCase().includes(selectedClass.toLowerCase());

      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, selectedClass]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return colors.success;
      case 'late':
        return colors.warning;
      case 'absent':
        return colors.error;
      default:
        return colors.outline;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present':
        return 'Présent';
      case 'late':
        return 'Retard';
      case 'absent':
        return 'Absent';
      default:
        return 'Inconnu';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Title Header with total count badge */}
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: colors.onSurface }]}>
            Liste des inscrits
          </Text>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: colors.surfaceContainerHigh },
            ]}>
            <Text style={[styles.countBadgeText, { color: colors.primary }]}>
              {filteredStudents.length} utilisateur{filteredStudents.length !== 1 ? 's' : ''} enregistré{filteredStudents.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Quick Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchInputWrapper,
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
              placeholder="Rechercher par nom, classe, tag..."
              placeholderTextColor={colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}>
                <Ionicons name="close-circle" size={18} color={colors.outline} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Horizontal Filter Chips Segmented Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContainer}>
          {FILTER_CLASSES.map((cls) => {
            const isSelected = selectedClass === cls;
            return (
              <TouchableOpacity
                key={cls}
                onPress={() => {
                  triggerHapticFeedback();
                  setSelectedClass(cls);
                }}
                activeOpacity={0.8}
                style={[
                  styles.filterChip,
                  isSelected
                    ? [styles.filterChipActive, { backgroundColor: colors.primaryContainer }]
                    : [
                        styles.filterChipInactive,
                        {
                          backgroundColor: colors.surfaceContainerLowest,
                          borderColor: colors.outlineVariant,
                        },
                      ],
                ]}>
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected ? '#ffffff' : colors.onSurfaceVariant,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}>
                  {cls}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Student Cards List */}
        <View style={styles.listContainer}>
          {filteredStudents.length === 0 ? (
            <View
              style={[
                styles.emptyStateCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}>
              <MaterialIcons
                name="person-search"
                size={48}
                color={colors.outline}
              />
              <Text style={[styles.emptyStateTitle, { color: colors.onSurface }]}>
                Aucun inscrit trouvé
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtitle,
                  { color: colors.onSurfaceVariant },
                ]}>
                Modifiez vos critères de recherche ou enregistrez un nouvel utilisateur.
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyAddButton,
                  { backgroundColor: colors.primaryContainer },
                ]}
                onPress={() => router.push('/inscription')}>
                <MaterialIcons name="person-add" size={18} color="#ffffff" />
                <Text style={styles.emptyAddButtonText}>Nouvelle Inscription</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredStudents.map((student) => {
              const statusColor = getStatusColor(student.status);
              return (
                <View
                  key={student.id}
                  style={[
                    styles.studentCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                    },
                  ]}>
                  {/* Top: Avatar, Name, Class & More Menu */}
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarRow}>
                      <View style={styles.avatarWrapper}>
                        <View
                          style={[
                            styles.avatarCircle,
                            { backgroundColor: colors.surfaceContainerLow },
                          ]}>
                          <Text
                            style={[
                              styles.avatarInitials,
                              { color: colors.primary },
                            ]}>
                            {getInitials(student.fullName)}
                          </Text>
                        </View>
                        {/* Status dot */}
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor: statusColor,
                              borderColor: colors.card,
                            },
                          ]}
                        />
                      </View>

                      <View style={styles.studentInfo}>
                        <Text
                          style={[
                            styles.studentName,
                            { color: colors.onSurface },
                          ]}>
                          {student.fullName}
                        </Text>
                        <View style={styles.classStatusRow}>
                          <Text
                            style={[
                              styles.studentClass,
                              { color: colors.onSurfaceVariant },
                            ]}>
                            {student.classSection}
                          </Text>
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor:
                                  student.status === 'present'
                                    ? colors.successContainer
                                    : student.status === 'late'
                                    ? colors.warningContainer
                                    : colors.errorContainer,
                              },
                            ]}>
                            <Text
                              style={[
                                styles.statusPillText,
                                { color: statusColor },
                              ]}>
                              {getStatusLabel(student.status)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        triggerHapticFeedback();
                        setActiveMenuStudent(student);
                      }}
                      style={styles.moreButton}
                      accessibilityLabel="Options de l'élève">
                      <MaterialIcons
                        name="more-vert"
                        size={22}
                        color={colors.outline}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Allocated Equipment Tag */}
                  {student.equipment && (
                    <View style={styles.equipmentRow}>
                      <MaterialIcons
                        name="devices"
                        size={14}
                        color={colors.outline}
                      />
                      <Text
                        style={[
                          styles.equipmentText,
                          { color: colors.onSurfaceVariant },
                        ]}>
                        {student.equipment}
                      </Text>
                    </View>
                  )}

                  {/* Bottom: Contact phone, NFC Tag badge, and Call CTA */}
                  <View
                    style={[
                      styles.cardFooter,
                      { borderTopColor: colors.surfaceContainer },
                    ]}>
                    <View style={styles.footerLeft}>
                      <View style={styles.phoneRow}>
                        <MaterialIcons
                          name="call"
                          size={15}
                          color={colors.outline}
                        />
                        <Text
                          style={[
                            styles.phoneText,
                            { color: colors.onSurfaceVariant },
                          ]}>
                          {student.phone}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.tagChip,
                          {
                            backgroundColor: colors.surfaceContainerLow,
                            borderColor: colors.surfaceContainerHighest,
                          },
                        ]}>
                        <MaterialIcons
                          name="contactless"
                          size={13}
                          color={colors.secondary}
                        />
                        <Text
                          style={[
                            styles.tagChipText,
                            { color: colors.onTertiaryContainer || colors.primary },
                          ]}>
                          Tag: #{student.tagId}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.callButton,
                        { backgroundColor: colors.primaryContainer },
                      ]}
                      onPress={() => callPhone(student.phone)}
                      activeOpacity={0.85}>
                      <MaterialIcons name="phone" size={17} color="#ffffff" />
                      <Text style={styles.callButtonText}>Appeler</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button to Register */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: colors.primaryContainer },
        ]}
        onPress={() => {
          triggerHapticFeedback();
          router.push('/inscription');
        }}
        activeOpacity={0.9}
        accessibilityLabel="Ajouter un inscrit">
        <MaterialIcons name="person-add" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Student Action Modal (Status update / Delete) */}
      <Modal
        visible={!!activeMenuStudent}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveMenuStudent(null)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setActiveMenuStudent(null)}>
          <Pressable
            style={[
              styles.actionModalSheet,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                {activeMenuStudent?.fullName}
              </Text>
              <Text style={[styles.modalSub, { color: colors.onSurfaceVariant }]}>
                Classe : {activeMenuStudent?.classSection} • #{activeMenuStudent?.tagId}
              </Text>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.outline }]}>
              Changer le statut de présence
            </Text>

            <View style={styles.statusButtonsRow}>
              {['present', 'late', 'absent'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.statusSelectButton,
                    activeMenuStudent?.status === st && {
                      borderColor: getStatusColor(st),
                      backgroundColor:
                        st === 'present'
                          ? colors.successContainer
                          : st === 'late'
                          ? colors.warningContainer
                          : colors.errorContainer,
                    },
                  ]}
                  onPress={() => {
                    if (activeMenuStudent) {
                      updateStudentStatus(activeMenuStudent.id, st);
                      setActiveMenuStudent(null);
                    }
                  }}>
                  <Text
                    style={[
                      styles.statusSelectText,
                      { color: getStatusColor(st) },
                    ]}>
                    {getStatusLabel(st)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.errorContainer }]}
              onPress={() => {
                if (activeMenuStudent) {
                  deleteStudent(activeMenuStudent.id);
                  setActiveMenuStudent(null);
                }
              }}>
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
              <Text style={[styles.deleteText, { color: colors.error }]}>
                Supprimer de la liste
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: colors.surfaceContainerLow },
              ]}
              onPress={() => setActiveMenuStudent(null)}>
              <Text style={[styles.cancelText, { color: colors.onSurface }]}>
                Annuler
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.eight + 50,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: Spacing.three,
  },
  searchInputWrapper: {
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
  clearSearchButton: {
    padding: 4,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
  },
  filterChipActive: {
    elevation: 2,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  filterChipInactive: {
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContainer: {
    gap: Spacing.three,
  },
  studentCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.four,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  classStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 2,
  },
  studentClass: {
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.sm,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  moreButton: {
    padding: 4,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.two,
  },
  equipmentText: {
    fontSize: 12,
  },
  cardFooter: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    gap: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: Radius.lg,
    elevation: 2,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyStateCard: {
    padding: Spacing.six,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: Spacing.four,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: Radius.lg,
  },
  emptyAddButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
    padding: Spacing.three,
  },
  actionModalSheet: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.four,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  modalHeader: {
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  statusSelectButton: {
    flex: 1,
    height: 38,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusSelectText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: Radius.lg,
    marginBottom: Spacing.two,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cancelButton: {
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
