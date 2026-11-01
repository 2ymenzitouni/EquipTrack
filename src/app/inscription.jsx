import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useEquipTrack } from '@/context/EquipTrackContext';
import { Spacing, Radius } from '@/constants/theme';

const CLASS_OPTIONS = [
  'Terminale S2 - Sciences & Technologies',
  'Première A - Littéraire & Arts',
  '1ère ES1 - Sciences Économiques',
  'Seconde 4 - Tronc Commun',
  '3ème B - Collège Général',
  'BTS SIO 1ère Année',
];

export default function InscriptionScreen() {
  const router = useRouter();
  const { colors, addStudent, showToast, triggerHapticFeedback } = useEquipTrack();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [equipment, setEquipment] = useState('');
  const [classSection, setClassSection] = useState(CLASS_OPTIONS[0]);
  const [phone, setPhone] = useState('');
  const [scannedTagId, setScannedTagId] = useState('NFC-88F4-902B-11A');
  const [isScanning, setIsScanning] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);

  // Radar wave pulsing animation
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const handleScanTag = () => {
    triggerHapticFeedback();
    setIsScanning(true);

    setTimeout(() => {
      const hexCodes = [
        'NFC-88F4-902B-11A',
        'NFC-44B1-28CD-90C',
        'RFID-330A-88EF-44',
        'NFC-19E0-74AA-52F',
        'RFID-992B-01CD-77',
      ];
      const randomTag = hexCodes[Math.floor(Math.random() * hexCodes.length)];
      setScannedTagId(randomTag);
      setIsScanning(false);
      showToast(`Badge ${randomTag} synchronisé !`);
      triggerHapticFeedback();
    }, 850);
  };

  const handleCopyTag = async () => {
    triggerHapticFeedback();
    try {
      if (Platform.OS === 'web') {
        navigator.clipboard?.writeText(scannedTagId);
      } else {
        await Clipboard.setStringAsync(scannedTagId);
      }
      showToast('Numéro de tag copié dans le presse-papier');
    } catch {
      showToast('Tag copié');
    }
  };

  const handleSubmit = () => {
    if (!fullName.trim()) {
      showToast('Veuillez renseigner le nom complet.');
      return;
    }
    if (!classSection.trim()) {
      showToast('Veuillez sélectionner une classe.');
      return;
    }

    addStudent({
      fullName: fullName.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@ecole.fr`,
      equipment: equipment.trim() || 'Tablette Connectée',
      classSection: classSection.split(' - ')[0] || classSection,
      phone: phone.trim() || '+33 6 00 00 00 00',
      tagId: scannedTagId,
      status: 'present',
    });

    // Reset and route to directory
    setFullName('');
    setEmail('');
    setEquipment('');
    setPhone('');
    router.push('/');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      {/* Page Title & Subtitle */}
      <View style={styles.headerSection}>
        <Text style={[styles.pageTitle, { color: colors.onSurface }]}>
          Nouvelle Inscription
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>
          Associer une fiche dossier au badge d’accès élève
        </Text>
      </View>

      {/* SECTION 1: Personal Information Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}>
        {/* Accent Top Bar */}
        <View
          style={[styles.cardAccentBar, { backgroundColor: colors.primaryContainer }]}
        />

        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleContainer}>
            <MaterialIcons name="person-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
              Informations Personnelles
            </Text>
          </View>
        </View>

        {/* Input: Nom complet */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>
            Nom complet <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}>
            <MaterialIcons
              name="badge"
              size={18}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.textInput, { color: colors.onSurface }]}
              placeholder="Ex: Thomas Laurent"
              placeholderTextColor={colors.outline}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        {/* Input: Email */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>
            Email de l’étudiant
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}>
            <MaterialIcons
              name="mail-outline"
              size={18}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.textInput, { color: colors.onSurface }]}
              placeholder="Ex: thomas.laurent@ecole.fr"
              placeholderTextColor={colors.outline}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Input: Équipement attribué */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>
            Équipement attribué
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}>
            <MaterialIcons
              name="devices"
              size={18}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.textInput, { color: colors.onSurface }]}
              placeholder="Ex: Tablette #12, PC Portable..."
              placeholderTextColor={colors.outline}
              value={equipment}
              onChangeText={setEquipment}
            />
          </View>
        </View>

        {/* Input: Classe & Section */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>
            Classe & Section <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}
            onPress={() => setClassModalOpen(!classModalOpen)}
            activeOpacity={0.7}>
            <MaterialIcons
              name="class"
              size={18}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <Text
              style={[
                styles.selectText,
                { color: classSection ? colors.onSurface : colors.outline },
              ]}
              numberOfLines={1}>
              {classSection || 'Sélectionner une classe'}
            </Text>
            <MaterialIcons
              name={classModalOpen ? 'expand-less' : 'expand-more'}
              size={22}
              color={colors.outline}
            />
          </TouchableOpacity>

          {/* Inline Class Picker Dropdown */}
          {classModalOpen && (
            <View
              style={[
                styles.dropdownMenu,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}>
              {CLASS_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.dropdownItem,
                    item === classSection && {
                      backgroundColor: colors.surfaceContainerLow,
                    },
                  ]}
                  onPress={() => {
                    setClassSection(item);
                    setClassModalOpen(false);
                  }}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      {
                        color:
                          item === classSection
                            ? colors.primary
                            : colors.onSurface,
                        fontWeight: item === classSection ? '700' : '400',
                      },
                    ]}>
                    {item}
                  </Text>
                  {item === classSection && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Input: Numéro de téléphone */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>
            Téléphone mobile
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}>
            <MaterialIcons
              name="phone"
              size={18}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.textInput, { color: colors.onSurface }]}
              placeholder="Ex: +33 6 12 34 56 78"
              placeholderTextColor={colors.outline}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>
      </View>

      {/* SECTION 2: Dedicated RFID/NFC Tag Scanning Module */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleContainer}>
            <MaterialIcons name="contactless" size={20} color={colors.secondary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
              Badge Sans Contact & RFID
            </Text>
          </View>
          {/* Green Success Badge */}
          <View
            style={[
              styles.tagStatusChip,
              {
                backgroundColor: colors.successContainer,
                borderColor: colors.successBorder,
              },
            ]}>
            <Ionicons name="checkmark-circle" size={14} color={colors.successText} />
            <Text style={[styles.tagStatusText, { color: colors.successText }]}>
              Tag détecté
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionDescription, { color: colors.onSurfaceVariant }]}>
          Rapprochez le badge NFC ou le porte-clé RFID de la borne ou du terminal mobile.
        </Text>

        {/* Radar Scanner Box */}
        <View
          style={[
            styles.radarContainer,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
            },
          ]}>
          {/* Animated decorative radar circle */}
          <Animated.View
            style={[
              styles.radarWave,
              {
                backgroundColor: colors.secondaryFixed,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />

          <TouchableOpacity
            style={[
              styles.scanButton,
              { backgroundColor: colors.secondary },
              isScanning && { opacity: 0.8 },
            ]}
            onPress={handleScanTag}
            activeOpacity={0.85}
            disabled={isScanning}>
            {isScanning ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.scanButtonText}>Détection en cours...</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="sensors" size={22} color="#ffffff" />
                <Text style={styles.scanButtonText}>Scanner le tag</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.radarStatusRow}>
            <View
              style={[styles.pingDot, { backgroundColor: colors.success }]}
            />
            <Text style={[styles.radarStatusText, { color: colors.onSurfaceVariant }]}>
              Capteur prêt pour la lecture 13.56 MHz
            </Text>
          </View>
        </View>

        {/* Scanned Tag ID display */}
        <View style={styles.tagIdSection}>
          <View style={styles.tagIdHeader}>
            <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>
              Identifiant du tag scanné
            </Text>
            <Text style={[styles.tagFrequencyLabel, { color: colors.primary }]}>
              MIFARE 13.56MHz
            </Text>
          </View>

          <View
            style={[
              styles.tagIdInputContainer,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.secondaryContainer,
              },
            ]}>
            <MaterialIcons
              name="nfc"
              size={22}
              color={colors.primary}
              style={styles.tagIdIcon}
            />
            <TextInput
              style={[styles.tagIdText, { color: colors.onSurface }]}
              value={scannedTagId}
              editable={false}
            />
            <TouchableOpacity
              onPress={handleCopyTag}
              style={[
                styles.copyButton,
                { backgroundColor: colors.surfaceContainerLowest },
              ]}
              accessibilityLabel="Copier l'identifiant">
              <MaterialIcons
                name="content-copy"
                size={18}
                color={colors.outline}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.securityFootnote}>
            <MaterialIcons name="lock" size={14} color={colors.outline} />
            <Text
              style={[styles.securityFootnoteText, { color: colors.onSurfaceVariant }]}>
              Badge chiffré et sécurisé avec le protocole de l’établissement.
            </Text>
          </View>
        </View>
      </View>

      {/* SECTION 3: Primary CTA Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: colors.primaryContainer },
        ]}
        onPress={handleSubmit}
        activeOpacity={0.85}>
        <MaterialIcons name="how-to-reg" size={24} color="#ffffff" />
        <Text style={styles.submitButtonText}>Enregistrer l’utilisateur</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: Spacing.four,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  card: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  cardAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
    marginTop: 2,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  inputIcon: {
    marginRight: Spacing.two,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  selectText: {
    flex: 1,
    fontSize: 14,
  },
  dropdownMenu: {
    marginTop: 6,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dropdownItemText: {
    fontSize: 13,
  },
  tagStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tagStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  radarContainer: {
    padding: Spacing.four,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.four,
  },
  radarWave: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.35,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    width: '100%',
    height: 48,
    borderRadius: Radius.lg,
    elevation: 3,
    shadowColor: '#0058be',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  radarStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.two,
  },
  pingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  radarStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  tagIdSection: {
    marginTop: 2,
  },
  tagIdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tagFrequencyLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tagIdInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
  },
  tagIdIcon: {
    marginRight: Spacing.two,
  },
  tagIdText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  copyButton: {
    padding: 6,
    borderRadius: Radius.sm,
  },
  securityFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  securityFootnoteText: {
    fontSize: 11,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 52,
    borderRadius: Radius.xl,
    elevation: 4,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: Spacing.six,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
