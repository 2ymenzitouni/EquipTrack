import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '@/components/ConfigurableText';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEquipTrack } from '@/context/EquipTrackContext';
import { supabase } from '@/constants/supabase';
import { Spacing, Radius } from '@/constants/theme';

const FILTER_CLASSES = [
  'Tous',
  'Licence',
  'Mastère',
  'Cycle Ingénieur',
];

function formatClassSection(classData) {
  let value = classData;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return value || 'Formation non renseignée';
    }
  }
  if (!value || typeof value !== 'object') return 'Formation non renseignée';

  const option =
    typeof value.option === 'string'
      ? value.option
      : value.option?.name || value.option?.code;
  return [
    value.program,
    value.section && value.section !== value.program ? value.section : null,
    value.specialty,
    value.class,
    value.year ? `Année ${value.year}` : null,
    option,
  ]
    .filter(Boolean)
    .join(' - ');
}

export default function RepertoireScreen() {
  const router = useRouter();
  const {
    colors,
    appearance,
    updateStudentStatus,
    deleteStudent,
    callPhone,
    sendEmail,
    triggerHapticFeedback,
    showToast,
  } = useEquipTrack();

  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Tous');
  const [activeMenuStudent, setActiveMenuStudent] = useState(null);
  const [scanningStudent, setScanningStudent] = useState(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const hasScannedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadRegisteredStudents = async () => {
        setIsLoadingStudents(true);
        const { data: studentRows, error: studentsError } = await supabase
          .from('students')
          .select('id,type,phone_number,full_name,email,class,created_at')
          .order('created_at', { ascending: false });

        if (studentsError) {
          console.error('Erreur lors du chargement des inscrits :', studentsError);
          if (isActive) {
            setStudents([]);
            showToast('Impossible de charger les inscrits depuis Supabase.');
            setIsLoadingStudents(false);
          }
          return;
        }

        if (!studentRows?.length) {
          if (isActive) {
            setStudents([]);
            setIsLoadingStudents(false);
          }
          return;
        }

        const { data: loanRows, error: loansError } = await supabase
          .from('loans')
          .select('student_id,equipment_name,nfc_uid')
          .in(
            'student_id',
            studentRows.map((student) => student.id)
          );

        if (loansError) {
          console.error('Erreur lors du chargement des prêts :', loansError);
          if (isActive) {
            setStudents([]);
            showToast('Impossible de charger les tags et équipements associés.');
            setIsLoadingStudents(false);
          }
          return;
        }

        const loansByStudent = new Map();
        loanRows?.forEach((loan) => {
          if (!loansByStudent.has(loan.student_id)) {
            loansByStudent.set(loan.student_id, loan);
          }
        });

        if (isActive) {
          setStudents(
            studentRows.map((student) => {
              const loan = loansByStudent.get(student.id);
              return {
                id: student.id,
                fullName: student.full_name || 'Nom non renseigné',
                email: student.email || '',
                phone: student.phone_number || '',
                classSection: formatClassSection(student.class),
                equipment: loan?.equipment_name || '',
                tagId: loan?.nfc_uid || '',
                status: 'present',
                registeredAt: student.created_at,
              };
            })
          );
          setIsLoadingStudents(false);
        }
      };

      loadRegisteredStudents().catch((error) => {
        console.error('Erreur inattendue lors du chargement des inscrits :', error);
        if (isActive) {
          setStudents([]);
          showToast('Impossible de charger les inscrits depuis Supabase.');
          setIsLoadingStudents(false);
        }
      });

      return () => {
        isActive = false;
      };
    }, [showToast])
  );

  const handleScanQr = async (student) => {
    triggerHapticFeedback();
    if (!student.tagId) {
      showToast('Aucun identifiant QR n’est enregistré pour cet élève.');
      return;
    }

    if (cameraPermission?.granted) {
      hasScannedRef.current = false;
      setScanningStudent(student);
      return;
    }

    try {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        showToast('Autorisez l’accès à la caméra pour scanner le code QR.');
        return;
      }

      hasScannedRef.current = false;
      setScanningStudent(student);
    } catch (error) {
      console.error('Erreur lors de la demande d’accès à la caméra :', error);
      showToast('Impossible d’accéder à la caméra.');
    }
  };

  const handleQrScanned = ({ data }) => {
    if (hasScannedRef.current || !scanningStudent) return;
    hasScannedRef.current = true;

    const matches =
      data.trim().toLowerCase() === scanningStudent.tagId.trim().toLowerCase();
    setScanningStudent(null);
    if (matches) {
      showToast(`QR vérifié : ${scanningStudent.fullName}.`);
      triggerHapticFeedback();
    } else {
      showToast(`Ce QR ne correspond pas au tag de ${scanningStudent.fullName}.`);
    }
  };

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
          {isLoadingStudents ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                Chargement des inscrits...
              </Text>
            </View>
          ) : filteredStudents.length === 0 ? (
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
              const actionButtons = {
                call: (
                  <TouchableOpacity
                    key="call"
                    style={[
                      styles.callButton,
                      appearance.layout.actions === 'inline' &&
                        styles.inlineActionButton,
                      {
                        backgroundColor:
                          appearance.theme.callButton || colors.primaryContainer,
                      },
                    ]}
                    onPress={() => callPhone(student.phone)}
                    activeOpacity={0.85}>
                    <MaterialIcons name="phone" size={17} color="#ffffff" />
                    <Text style={styles.callButtonText}>Appeler</Text>
                  </TouchableOpacity>
                ),
                scanQr: (
                  <TouchableOpacity
                    key="scanQr"
                    style={[
                      styles.scanQrButton,
                      appearance.layout.actions === 'inline' &&
                        styles.inlineActionButton,
                      {
                        backgroundColor: colors.surfaceContainerLow,
                        borderColor: colors.surfaceContainerHighest,
                      },
                      !student.tagId && styles.disabledAction,
                    ]}
                    onPress={() => handleScanQr(student)}
                    disabled={!student.tagId}
                    activeOpacity={0.85}>
                    <MaterialIcons
                      name="qr-code-scanner"
                      size={17}
                      color={colors.primary}
                    />
                    <Text style={[styles.scanQrButtonText, { color: colors.primary }]}>
                      Scan QR
                    </Text>
                  </TouchableOpacity>
                ),
                email: (
                  <TouchableOpacity
                    key="email"
                    style={[
                      styles.emailButton,
                      appearance.layout.actions === 'inline' &&
                        styles.inlineFullWidthAction,
                      {
                        backgroundColor: colors.surfaceContainerLow,
                        borderColor: colors.surfaceContainerHighest,
                      },
                      !student.email && styles.disabledAction,
                    ]}
                    onPress={() => sendEmail(student.email)}
                    disabled={!student.email}
                    activeOpacity={0.85}
                    accessibilityLabel={`Envoyer un e-mail à ${student.fullName}`}>
                    <MaterialIcons
                      name="email"
                      size={17}
                      color={colors.primary}
                    />
                    <Text style={[styles.scanQrButtonText, { color: colors.primary }]}>
                      Envoyer un e-mail
                    </Text>
                  </TouchableOpacity>
                ),
              };
              const actionOrder =
                appearance.layout.order === 'scan-first'
                  ? ['scanQr', 'call']
                  : ['call', 'scanQr'];
              const orderedActions = actionOrder.flatMap((action) =>
                action === 'call' ? ['call', 'email'] : [action]
              );

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
                      appearance.layout.actions === 'inline' &&
                        styles.cardFooterInline,
                    ]}>
                    <View style={styles.footerLeft}>
                        {student.email ? (
                          <View style={styles.emailContactRow}>
                            <MaterialIcons
                              name="email"
                              size={15}
                              color={colors.outline}
                            />
                            <Text
                              style={[
                                styles.phoneText,
                                { color: colors.onSurfaceVariant },
                              ]}>
                              {student.email}
                            </Text>
                          </View>
                        ) : null}
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

                    <View
                      style={[
                        styles.cardActions,
                        appearance.layout.actions === 'inline' &&
                          styles.cardActionsInline,
                      ]}>
                      {orderedActions.map((action) => actionButtons[action])}
                    </View>
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
                      setStudents((current) =>
                        current.map((student) =>
                          student.id === activeMenuStudent.id
                            ? { ...student, status: st }
                            : student
                        )
                      );
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
                  setStudents((current) =>
                    current.filter((student) => student.id !== activeMenuStudent.id)
                  );
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

      <Modal
        visible={!!scanningStudent}
        animationType="slide"
        onRequestClose={() => setScanningStudent(null)}>
        <View style={styles.qrScannerModal}>
          {scanningStudent && (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleQrScanned}
              onMountError={(event) => {
                console.error('Erreur d’ouverture de la caméra :', event.message);
                setScanningStudent(null);
                showToast('Impossible d’ouvrir la caméra.');
              }}
            />
          )}
          <View style={styles.qrScannerHeader}>
            <TouchableOpacity
              style={styles.qrScannerClose}
              onPress={() => setScanningStudent(null)}
              accessibilityLabel="Fermer le scanner QR">
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.qrScannerTitle}>Scanner le QR de l’élève</Text>
            <Text style={styles.qrScannerSubtitle}>
              {scanningStudent?.fullName}
            </Text>
          </View>
          <View style={styles.qrScannerFrame} pointerEvents="none" />
        </View>
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
  emailContactRow: {
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
  cardActions: {
    alignItems: 'stretch',
    gap: Spacing.two,
  },
  cardActionsInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardFooterInline: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.two,
  },
  inlineActionButton: {
    flex: 1,
  },
  inlineFullWidthAction: {
    flexBasis: '100%',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  scanQrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  scanQrButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  disabledAction: {
    opacity: 0.45,
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
  qrScannerModal: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrScannerHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 24,
    left: Spacing.four,
    right: Spacing.four,
    alignItems: 'center',
  },
  qrScannerClose: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: Spacing.two,
  },
  qrScannerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  qrScannerSubtitle: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: Spacing.one,
  },
  qrScannerFrame: {
    width: '72%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: Radius.xl,
  },
});
