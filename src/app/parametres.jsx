import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '@/components/ConfigurableText';
import { MaterialIcons } from '@expo/vector-icons';
import { readNdefText } from '@/utils/nfcScanner';
import { useEquipTrack } from '@/context/EquipTrackContext';
import { Spacing, Radius } from '@/constants/theme';

export default function ParametresScreen() {
  const {
    colors,
    applyAppearanceConfig,
    translateText,
    themeSetting,
    settings,
    setThemeSetting,
    updateSettings,
    clearScanHistory,
    resetToDefaults,
    showToast,
    triggerHapticFeedback,
  } = useEquipTrack();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [appearanceConfig, setAppearanceConfig] = useState('');
  const [isNfcScanning, setIsNfcScanning] = useState(false);
  const nfcScanRef = useRef(false);

  const handleCheckUpdate = async () => {
    triggerHapticFeedback();
    setIsCheckingUpdate(true);
    try {
      const wasReset = await applyAppearanceConfig(appearanceConfig);
      showToast(
        wasReset
          ? 'Configuration visuelle réinitialisée.'
          : 'Configuration visuelle mise à jour.'
      );
      triggerHapticFeedback();
    } catch (error) {
      console.error('Erreur lors de l’application de la configuration :', error);
      showToast(error.message || 'Impossible d’appliquer cette configuration.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleScanNdefTag = async () => {
    if (nfcScanRef.current) return;
    nfcScanRef.current = true;
    setIsNfcScanning(true);
    triggerHapticFeedback();

    try {
      const config = await readNdefText();
      setAppearanceConfig(config);
      showToast('Configuration NDEF lue et ajoutée au champ.');
      triggerHapticFeedback();
    } catch (error) {
      console.error('Erreur lors de la lecture de la configuration NDEF :', error);
      if (error?.message === 'NFC_UNSUPPORTED') {
        showToast('Ce téléphone ne prend pas en charge la lecture NFC.');
      } else if (error?.message === 'NFC_NATIVE_APP_REQUIRED') {
        showToast('La lecture NFC nécessite l’application iOS ou Android.');
      } else if (error?.message === 'NFC_NDEF_TEXT_UNAVAILABLE') {
        showToast('Le tag détecté ne contient aucun enregistrement NDEF texte.');
      } else {
        showToast('Lecture NFC annulée ou impossible. Réessayez avec un tag NDEF.');
      }
    } finally {
      nfcScanRef.current = false;
      setIsNfcScanning(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      translateText('Vider l’historique'),
      translateText('Êtes-vous sûr de vouloir supprimer tous les scans enregistrés ?'),
      [
        { text: translateText('Annuler'), style: 'cancel' },
        {
          text: translateText('Vider'),
          style: 'destructive',
          onPress: clearScanHistory,
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      translateText('Réinitialiser les données'),
      translateText('Rétablir les élèves et scans par défaut de la démonstration ?'),
      [
        { text: translateText('Annuler'), style: 'cancel' },
        {
          text: translateText('Réinitialiser'),
          onPress: resetToDefaults,
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      {/* Header section with Campus Configuration Badge */}
      <View style={styles.headerSection}>
        <View
          style={[
            styles.campusBadge,
            { backgroundColor: colors.surfaceContainerLow },
          ]}>
          <MaterialIcons name="tune" size={14} color={colors.primary} />
          <Text style={[styles.campusBadgeText, { color: colors.primary }]}>
            Configuration Campus
          </Text>
        </View>

        <Text style={[styles.pageTitle, { color: colors.onSurface }]}>
          Paramètres de l’application
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>
          Personnalisez l’affichage, les capteurs de proximité RFID.
        </Text>
      </View>

      {/* SECTION 1: Apparence & Thème */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}>
        <View style={styles.sectionHeaderRow}>
          <View
            style={[
              styles.sectionIconBox,
              { backgroundColor: colors.surfaceContainerLow },
            ]}>
            <MaterialIcons name="palette" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Apparence & Thème
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant }]}>
              Confort visuel pour usage en salle ou cour
            </Text>
          </View>
        </View>

        {/* Side-by-side Theme Selector Cards */}
        <View style={styles.themeGrid}>
          {/* Card: Mode Clair */}
          <TouchableOpacity
            style={[
              styles.themeCard,
              {
                backgroundColor: colors.surface,
                borderColor:
                  themeSetting === 'light'
                    ? colors.primaryContainer
                    : colors.outlineVariant,
                borderWidth: themeSetting === 'light' ? 2 : 1,
              },
            ]}
            onPress={() => {
              triggerHapticFeedback();
              setThemeSetting('light');
            }}
            activeOpacity={0.85}>
            <View style={styles.themeCardTop}>
              <MaterialIcons
                name="light-mode"
                size={22}
                color={
                  themeSetting === 'light' ? colors.primary : colors.onSurfaceVariant
                }
              />
              <View
                style={[
                  styles.themeCheckCircle,
                  {
                    backgroundColor:
                      themeSetting === 'light'
                        ? colors.primaryContainer
                        : 'transparent',
                    borderColor:
                      themeSetting === 'light'
                        ? colors.primaryContainer
                        : colors.outlineVariant,
                  },
                ]}>
                {themeSetting === 'light' && (
                  <MaterialIcons name="check" size={13} color="#ffffff" />
                )}
              </View>
            </View>

            {/* Visual Mini Mockup */}
            <View style={[styles.miniPreviewBox, { backgroundColor: '#ffffff' }]}>
              <View
                style={[
                  styles.miniPreviewBarPrimary,
                  { backgroundColor: 'rgba(67, 56, 202, 0.25)' },
                ]}
              />
              <View
                style={[
                  styles.miniPreviewBarSub,
                  { backgroundColor: 'rgba(199, 196, 215, 0.5)' },
                ]}
              />
            </View>

            <Text style={[styles.themeLabel, { color: colors.onSurface }]}>
              Mode Clair
            </Text>
            <Text style={[styles.themeSubLabel, { color: colors.onSurfaceVariant }]}>
              Recommandé
            </Text>
          </TouchableOpacity>

          {/* Card: Mode Sombre */}
          <TouchableOpacity
            style={[
              styles.themeCard,
              {
                backgroundColor:
                  themeSetting === 'dark' ? colors.surface : colors.surfaceContainerLow,
                borderColor:
                  themeSetting === 'dark'
                    ? colors.primaryContainer
                    : colors.outlineVariant,
                borderWidth: themeSetting === 'dark' ? 2 : 1,
              },
            ]}
            onPress={() => {
              triggerHapticFeedback();
              setThemeSetting('dark');
            }}
            activeOpacity={0.85}>
            <View style={styles.themeCardTop}>
              <MaterialIcons
                name="dark-mode"
                size={22}
                color={
                  themeSetting === 'dark' ? colors.primary : colors.onSurfaceVariant
                }
              />
              <View
                style={[
                  styles.themeCheckCircle,
                  {
                    backgroundColor:
                      themeSetting === 'dark'
                        ? colors.primaryContainer
                        : 'transparent',
                    borderColor:
                      themeSetting === 'dark'
                        ? colors.primaryContainer
                        : colors.outlineVariant,
                  },
                ]}>
                {themeSetting === 'dark' && (
                  <MaterialIcons name="check" size={13} color="#ffffff" />
                )}
              </View>
            </View>

            {/* Visual Mini Mockup */}
            <View style={[styles.miniPreviewBox, { backgroundColor: '#1e293b' }]}>
              <View
                style={[
                  styles.miniPreviewBarPrimary,
                  { backgroundColor: 'rgba(193, 190, 255, 0.4)' },
                ]}
              />
              <View
                style={[
                  styles.miniPreviewBarSub,
                  { backgroundColor: 'rgba(100, 116, 139, 0.4)' },
                ]}
              />
            </View>

            <Text style={[styles.themeLabel, { color: colors.onSurface }]}>
              Mode Sombre
            </Text>
            <Text style={[styles.themeSubLabel, { color: colors.onSurfaceVariant }]}>
              Économie batterie
            </Text>
          </TouchableOpacity>
        </View>

        {/* System Theme option button */}
        <TouchableOpacity
          style={[
            styles.systemThemeRow,
            { borderTopColor: colors.outlineVariant },
          ]}
          onPress={() => {
            triggerHapticFeedback();
            setThemeSetting('system');
            showToast('Thème configuré selon le système');
          }}>
          <View style={styles.systemThemeLeft}>
            <MaterialIcons
              name="settings-brightness"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.systemThemeText, { color: colors.onSurface }]}>
              Synchroniser avec le thème de l’appareil
            </Text>
          </View>
          {themeSetting === 'system' && (
            <MaterialIcons
              name="check-circle"
              size={18}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* SECTION 2: Système & Mises à jour */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}>
        <View style={styles.sectionHeaderRow}>
          <View
            style={[
              styles.sectionIconBox,
              { backgroundColor: colors.surfaceContainerLow },
            ]}>
            <MaterialIcons name="system-update" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Système & Mises à jour
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant }]}>
              État du terminal et intégrité applicative
            </Text>
          </View>
        </View>

        {/* Info card */}
        <View
          style={[
            styles.systemInfoBox,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
            },
          ]}>
          <View style={styles.systemRow}>
            <View style={styles.systemRowLeft}>
              <MaterialIcons name="verified" size={18} color={colors.primary} />
              <View>
                <Text style={[styles.systemRowTitle, { color: colors.onSurface }]}>
                  Version actuelle
                </Text>
                <Text
                  style={[
                    styles.systemRowSub,
                    { color: colors.onSurfaceVariant },
                  ]}>
                  {settings.appVersion}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.upToDateBadge,
                {
                  backgroundColor: colors.successContainer,
                  borderColor: colors.successBorder,
                },
              ]}>
              <Text
                style={[styles.upToDateText, { color: colors.successText }]}>
                À jour
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: colors.outlineVariant, opacity: 0.3 },
            ]}
          />

          <View style={styles.systemRow}>
            <View style={styles.systemRowLeft}>
              <MaterialIcons
                name="contactless"
                size={18}
                color={colors.secondary}
              />
              <View>
                <Text style={[styles.systemRowTitle, { color: colors.onSurface }]}>
                  Module Lecteur NFC/RFID
                </Text>
                <Text
                  style={[
                    styles.systemRowSub,
                    { color: colors.onSurfaceVariant },
                  ]}>
                  {settings.hardwareDriver}
                </Text>
              </View>
            </View>
            <View style={styles.syncRow}>
              <View
                style={[styles.syncDot, { backgroundColor: colors.success }]}
              />
              <Text style={[styles.syncText, { color: colors.successText }]}>
                Synchronisé
              </Text>
            </View>
          </View>
        </View>

        {/* Mettre à jour CTA */}
        <TouchableOpacity
          style={[
            styles.updateButton,
            { backgroundColor: colors.primaryContainer },
          ]}
          onPress={handleCheckUpdate}
          disabled={isCheckingUpdate}
          activeOpacity={0.85}>
          {isCheckingUpdate ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <MaterialIcons name="sync" size={18} color="#ffffff" />
          )}
          <Text style={styles.updateButtonText}>
            {isCheckingUpdate ? 'Vérification...' : 'Mettre à jour'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[
            styles.configInput,
            {
              color: colors.onSurface,
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
            },
          ]}
          value={appearanceConfig}
          onChangeText={setAppearanceConfig}
          placeholder={'{"version":1,"layout":{"actions":"inline","order":"scan-first"},"text":{"Appeler":"Contacter","Scan QR":"Vérifier le code"}}'}
          placeholderTextColor={colors.outline}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          textAlignVertical="top"
          accessibilityLabel="Configuration visuelle NDEF"
        />
        <Text
          style={[
            styles.configHelp,
            { color: colors.onSurfaceVariant },
          ]}>
          Le tag NFC doit contenir la configuration JSON dans un enregistrement
          NDEF texte. Couleurs acceptées : backgroundColor, callButton, primary,
          primaryContainer, card, onSurface, onSurfaceVariant. Disposition des
          boutons du répertoire : stacked ou inline; leur ordre : call-first ou
          scan-first. Dans « text », chaque clé doit correspondre exactement
          au texte affiché à remplacer.
        </Text>

        <TouchableOpacity
          style={[
            styles.scanNdefButton,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
            },
          ]}
          onPress={handleScanNdefTag}
          disabled={isNfcScanning}
          activeOpacity={0.85}>
          {isNfcScanning ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialIcons name="contactless" size={18} color={colors.primary} />
          )}
          <Text style={[styles.scanNdefButtonText, { color: colors.primary }]}>
            {isNfcScanning ? 'Lecture du tag NFC...' : 'Scanner un tag NFC NDEF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SECTION 3: Lecteur NFC & Badges RFID */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}>
        <View style={styles.sectionHeaderRow}>
          <View
            style={[
              styles.sectionIconBox,
              { backgroundColor: colors.surfaceContainerLow },
            ]}>
            <MaterialIcons name="nfc" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Lecteur NFC & Badges RFID
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant }]}>
              Comportement lors du pointage d’élèves
            </Text>
          </View>
        </View>

        {/* Sound toggle */}
        <View style={styles.settingToggleRow}>
          <View style={styles.toggleLeft}>
            <MaterialIcons
              name="volume-up"
              size={20}
              color={colors.onSurfaceVariant}
            />
            <View>
              <Text style={[styles.toggleTitle, { color: colors.onSurface }]}>
                Bip sonore lors du scan
              </Text>
              <Text
                style={[styles.toggleSubtitle, { color: colors.onSurfaceVariant }]}>
                Confirmation audio de présence validée
              </Text>
            </View>
          </View>
          <Switch
            value={settings.soundBeep}
            onValueChange={(val) => {
              triggerHapticFeedback();
              updateSettings({ soundBeep: val });
            }}
            trackColor={{ false: '#cbd5e1', true: colors.primaryContainer }}
            thumbColor="#ffffff"
          />
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: colors.outlineVariant, opacity: 0.25 },
          ]}
        />

        {/* Haptic vibration toggle */}
        <View style={styles.settingToggleRow}>
          <View style={styles.toggleLeft}>
            <MaterialIcons
              name="vibration"
              size={20}
              color={colors.onSurfaceVariant}
            />
            <View>
              <Text style={[styles.toggleTitle, { color: colors.onSurface }]}>
                Retour haptique / Vibration
              </Text>
              <Text
                style={[styles.toggleSubtitle, { color: colors.onSurfaceVariant }]}>
                Impulsion courte à chaque détection
              </Text>
            </View>
          </View>
          <Switch
            value={settings.hapticVibration}
            onValueChange={(val) => {
              triggerHapticFeedback();
              updateSettings({ hapticVibration: val });
            }}
            trackColor={{ false: '#cbd5e1', true: colors.primaryContainer }}
            thumbColor="#ffffff"
          />
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: colors.outlineVariant, opacity: 0.25 },
          ]}
        />

        {/* Sensor sensitivity */}
        <View style={styles.sensitivitySection}>
          <Text style={[styles.sensitivityTitle, { color: colors.onSurface }]}>
            Sensibilité du capteur NFC
          </Text>
          <View style={styles.sensitivityRow}>
            {['low', 'medium', 'high'].map((level) => {
              const isSelected = settings.sensorSensitivity === level;
              const labels = {
                low: 'Basse (2 cm)',
                medium: 'Moyenne (5 cm)',
                high: 'Haute (10 cm)',
              };
              return (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.sensitivityButton,
                    isSelected
                      ? [
                          styles.sensitivityButtonActive,
                          { backgroundColor: colors.primaryContainer },
                        ]
                      : [
                          styles.sensitivityButtonInactive,
                          {
                            backgroundColor: colors.surfaceContainerLow,
                            borderColor: colors.outlineVariant,
                          },
                        ],
                  ]}
                  onPress={() => {
                    triggerHapticFeedback();
                    updateSettings({ sensorSensitivity: level });
                  }}>
                  <Text
                    style={[
                      styles.sensitivityButtonText,
                      {
                        color: isSelected ? '#ffffff' : colors.onSurface,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}>
                    {labels[level]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* SECTION 4: Données & Réinitialisation */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}>
        <View style={styles.sectionHeaderRow}>
          <View
            style={[
              styles.sectionIconBox,
              { backgroundColor: colors.surfaceContainerLow },
            ]}>
            <MaterialIcons name="security" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Sécurité & Données
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant }]}>
              Maintenance et réinitialisation de la mémoire
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.dataActionRow,
            { borderBottomColor: colors.outlineVariant },
          ]}
          onPress={handleClearHistory}>
          <View style={styles.dataActionLeft}>
            <MaterialIcons
              name="cleaning-services"
              size={18}
              color={colors.error}
            />
            <Text style={[styles.dataActionText, { color: colors.error }]}>
              Vider le cache des scans
            </Text>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={colors.outline}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dataActionRow}
          onPress={handleResetData}>
          <View style={styles.dataActionLeft}>
            <MaterialIcons
              name="restore"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.dataActionText, { color: colors.primary }]}>
              Réinitialiser les données de démonstration
            </Text>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={colors.outline}
          />
        </TouchableOpacity>
      </View>

      {/* FOOTER: Institutional info */}
      <View style={styles.institutionalFooter}>
        <MaterialIcons name="school" size={20} color={colors.outline} />
        <Text style={[styles.footerText, { color: colors.outline }]}>
          Édifice Numérique • Plateforme certifiée Éducation & Gestion d’équipements scolaires.
        </Text>
      </View>

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
  campusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    marginBottom: 6,
  },
  campusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
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
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  sectionIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  themeCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Radius.xl,
    alignItems: 'center',
  },
  themeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  themeCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPreviewBox: {
    width: '100%',
    height: 44,
    borderRadius: Radius.md,
    padding: 6,
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  miniPreviewBarPrimary: {
    width: '75%',
    height: 7,
    borderRadius: 4,
  },
  miniPreviewBarSub: {
    width: '50%',
    height: 7,
    borderRadius: 4,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  themeSubLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  systemThemeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  systemThemeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  systemThemeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  systemInfoBox: {
    padding: Spacing.three,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  systemRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  systemRowTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  systemRowSub: {
    fontSize: 11,
  },
  upToDateBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  upToDateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '600',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 48,
    borderRadius: Radius.xl,
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  configInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginTop: Spacing.three,
    fontSize: 14,
  },
  configHelp: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: Spacing.one,
  },
  scanNdefButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: Spacing.two,
  },
  scanNdefButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleSubtitle: {
    fontSize: 11,
  },
  sensitivitySection: {
    paddingTop: Spacing.two,
  },
  sensitivityTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.two,
  },
  sensitivityRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  sensitivityButton: {
    flex: 1,
    height: 38,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensitivityButtonActive: {
    elevation: 2,
  },
  sensitivityButtonInactive: {
    borderWidth: 1,
  },
  sensitivityButtonText: {
    fontSize: 10,
  },
  dataActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  dataActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dataActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  institutionalFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
