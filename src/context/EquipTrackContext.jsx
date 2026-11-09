import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useColorScheme, Platform, Linking, Alert } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { parseAppearanceConfig } from '@/utils/appearanceConfig';

const APPEARANCE_STORAGE_KEY = '@equiptrack/appearance';

const INITIAL_STUDENTS = [
  {
    id: 'std_1',
    fullName: 'Sophie Martin',
    email: 'sophie.martin@ecole.fr',
    equipment: 'Tablette iPad Pro #04',
    classSection: 'Terminale S2',
    phone: '+33 6 45 89 12 30',
    tagId: 'NFC-88F4',
    status: 'present',
    registeredAt: '2026-10-15',
  },
  {
    id: 'std_2',
    fullName: 'Lucas Dubois',
    email: 'lucas.dubois@ecole.fr',
    equipment: 'PC Dell Latitude #18',
    classSection: 'Première A',
    phone: '+33 6 12 34 56 78',
    tagId: 'RFID-330A',
    status: 'late',
    registeredAt: '2026-10-18',
  },
  {
    id: 'std_3',
    fullName: 'Camille Bernard',
    email: 'camille.bernard@ecole.fr',
    equipment: 'Casque Audio Studio #02',
    classSection: 'Terminale S2',
    phone: '+33 7 98 44 21 00',
    tagId: 'NFC-401C',
    status: 'present',
    registeredAt: '2026-10-20',
  },
  {
    id: 'std_4',
    fullName: 'Alexandre Petit',
    email: 'alexandre.petit@ecole.fr',
    equipment: 'Tablette Samsung #07',
    classSection: 'Seconde 4',
    phone: '+33 6 78 90 12 44',
    tagId: 'RFID-992B',
    status: 'absent',
    registeredAt: '2026-10-22',
  },
  {
    id: 'std_5',
    fullName: 'Emma Legrand',
    email: 'emma.legrand@ecole.fr',
    equipment: 'PC Lenovo ThinkPad #09',
    classSection: 'Terminale ES1',
    phone: '+33 6 22 33 44 55',
    tagId: 'NFC-77A1',
    status: 'present',
    registeredAt: '2026-10-25',
  },
  {
    id: 'std_6',
    fullName: 'Maxime Bernard',
    email: 'maxime.bernard@ecole.fr',
    equipment: 'Calculatrice Graphique NumWorks #15',
    classSection: '3ème B',
    phone: '+33 6 99 88 77 66',
    tagId: 'RFID-330A',
    status: 'present',
    registeredAt: '2026-10-28',
  },
];

const INITIAL_SCANS = [
  {
    id: 'scan_1',
    studentId: 'std_1',
    studentName: 'Sophie Martin',
    initials: 'SM',
    tagId: 'NFC-88F4',
    time: '14:32',
    timeGroup: 'afternoon',
    type: 'entry',
    statusText: 'Pointage Entrée',
    detail: 'Autorisation parentale valide',
    statusVariant: 'success',
  },
  {
    id: 'scan_2',
    studentId: 'std_2',
    studentName: 'Lucas Dubois',
    initials: 'LD',
    tagId: 'RFID-419B',
    time: '14:15',
    timeGroup: 'afternoon',
    type: 'exit',
    statusText: 'Sortie Autorisée',
    detail: 'Fin des cours : 14h00 (EDT conforme)',
    statusVariant: 'info',
  },
  {
    id: 'scan_3',
    studentId: 'std_4',
    studentName: 'Alexandre Petit',
    initials: 'AP',
    tagId: 'RFID-990E',
    time: '12:45',
    timeGroup: 'lunch',
    type: 'denied',
    statusText: 'Accès Refusé',
    detail: 'Badge non inscrit à la demi-pension',
    statusVariant: 'error',
  },
  {
    id: 'scan_4',
    studentId: 'std_5',
    studentName: 'Emma Legrand',
    initials: 'EL',
    tagId: 'NFC-77A1',
    time: '12:20',
    timeGroup: 'lunch',
    type: 'entry',
    statusText: 'Pointage Entrée',
    detail: 'Formule Standard • Solde : 14 repas',
    statusVariant: 'success',
  },
  {
    id: 'scan_5',
    studentId: 'std_6',
    studentName: 'Maxime Bernard',
    initials: 'MB',
    tagId: 'RFID-330A',
    time: '07:58',
    timeGroup: 'morning',
    type: 'entry',
    statusText: 'Entrée Matinale',
    detail: "À l'heure pour le cours de 08:00",
    statusVariant: 'success',
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Alerte sécurité accès cantine',
    message: 'Badge RFID non autorisé scanné au self par Alexandre Petit.',
    time: 'Il y a 45 min',
    type: 'alert',
    read: false,
  },
  {
    id: 'notif_2',
    title: 'Module Lecteur NFC/RFID',
    message: 'Borne entrée principale connectée et synchronisée avec succès.',
    time: 'Il y a 2 h',
    type: 'success',
    read: false,
  },
  {
    id: 'notif_3',
    title: 'Sauvegarde des présences',
    message: 'Journal des scans archivé et sécurisé pour l’académie.',
    time: 'Ce matin à 08:00',
    type: 'info',
    read: true,
  },
];

const EquipTrackContext = createContext(undefined);

export function EquipTrackProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeSetting, setThemeSetting] = useState('light');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [scans, setScans] = useState(INITIAL_SCANS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [toastMessage, setToastMessage] = useState(null);
  const [appearance, setAppearance] = useState({
    theme: {},
    layout: { actions: 'stacked', order: 'call-first' },
    text: {},
  });
  const appearanceRef = useRef(appearance);
  const appearanceLoadPromiseRef = useRef(Promise.resolve());

  const [settings, setSettings] = useState({
    themeSetting: 'light',
    soundBeep: true,
    hapticVibration: true,
    sensorSensitivity: 'medium',
    appVersion: 'Version 2.4.1 (Build 890)',
    hardwareDriver: 'Pilote matériel v3.2 • Connecté',
  });

  const activeTheme = useMemo(() => {
    if (themeSetting === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return themeSetting;
  }, [themeSetting, systemScheme]);

  const colors = useMemo(() => {
    return { ...Colors[activeTheme], ...appearance.theme };
  }, [activeTheme, appearance.theme]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const showToast = useCallback((msg, variant = 'default') => {
    setToastMessage({ message: msg, variant });
  }, []);
  const translateText = useCallback(
    (value) =>
      typeof value === 'string' ? appearance.text?.[value] ?? value : value,
    [appearance.text]
  );

  useEffect(() => {
    let isActive = true;
    appearanceLoadPromiseRef.current = AsyncStorage.getItem(APPEARANCE_STORAGE_KEY)
      .then((storedConfig) => {
        if (!storedConfig || !isActive) return;
        const restoredAppearance = parseAppearanceConfig(storedConfig);
        if (isActive) {
          const nextAppearance = {
            theme: { ...appearanceRef.current.theme, ...restoredAppearance.theme },
            layout: { ...appearanceRef.current.layout, ...restoredAppearance.layout },
            text: { ...appearanceRef.current.text, ...restoredAppearance.text },
          };
          appearanceRef.current = nextAppearance;
          setAppearance(nextAppearance);
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement de la configuration visuelle :', error);
        if (isActive) {
          showToast('Impossible de charger la configuration visuelle enregistrée.');
        }
      });

    return () => {
      isActive = false;
    };
  }, [showToast]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const triggerHapticFeedback = () => {
    if (settings.hapticVibration && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  };

  const addStudent = (data) => {
    triggerHapticFeedback();
    const newStudent = {
      ...data,
      id: `std_${Date.now()}`,
      registeredAt: new Date().toISOString().split('T')[0],
    };
    setStudents((prev) => [newStudent, ...prev]);

    // Also register an initial scan event
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const newScan = {
      id: `scan_${Date.now()}`,
      studentId: newStudent.id,
      studentName: newStudent.fullName,
      initials: newStudent.fullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      tagId: newStudent.tagId,
      time: timeStr,
      timeGroup: 'afternoon',
      type: 'entry',
      statusText: 'Inscription Validée',
      detail: `Badge ${newStudent.tagId} associé avec succès`,
      statusVariant: 'success',
    };
    setScans((prev) => [newScan, ...prev]);
    showToast(`Utilisateur ${newStudent.fullName} enregistré !`);
  };

  const updateStudentStatus = (id, status) => {
    triggerHapticFeedback();
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    showToast('Statut de présence mis à jour');
  };

  const deleteStudent = (id) => {
    triggerHapticFeedback();
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast('Utilisateur supprimé');
  };

  const simulateTagScan = (customTag) => {
    triggerHapticFeedback();
    const availableTags = customTag
      ? [customTag]
      : students.map((s) => s.tagId).concat(['RFID-UNKNOWN-99']);

    const randomTag =
      availableTags[Math.floor(Math.random() * availableTags.length)];

    const matchedStudent = students.find((s) => s.tagId === randomTag);

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    let newScan;

    if (matchedStudent) {
      newScan = {
        id: `scan_${Date.now()}`,
        studentId: matchedStudent.id,
        studentName: matchedStudent.fullName,
        initials: matchedStudent.fullName
          .split(' ')
          .map((p) => p[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        tagId: randomTag,
        time: timeStr,
        timeGroup: 'afternoon',
        type: 'entry',
        statusText: 'Pointage Entrée',
        detail: 'Autorisation parentale valide',
        statusVariant: 'success',
      };
      showToast(`Scan validé : ${matchedStudent.fullName} (#${randomTag})`);
    } else {
      newScan = {
        id: `scan_${Date.now()}`,
        studentName: 'Tag Inconnu',
        initials: '??',
        tagId: randomTag,
        time: timeStr,
        timeGroup: 'afternoon',
        type: 'denied',
        statusText: 'Accès Refusé',
        detail: 'Identifiant non répertorié dans la base',
        statusVariant: 'error',
      };
      showToast(`Alerte : Tag inconnu #${randomTag}`);
    }

    setScans((prev) => [newScan, ...prev]);
    return newScan;
  };

  const updateSettings = (partial) => {
    triggerHapticFeedback();
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      if (partial.themeSetting) {
        setThemeSetting(partial.themeSetting);
      }
      return next;
    });
  };

  const applyAppearanceConfig = async (json) => {
    const parsedAppearance = parseAppearanceConfig(json);
    await appearanceLoadPromiseRef.current;
    if (parsedAppearance.reset) {
      await AsyncStorage.removeItem(APPEARANCE_STORAGE_KEY);
      const defaultAppearance = {
        theme: {},
        layout: { actions: 'stacked', order: 'call-first' },
        text: {},
      };
      appearanceRef.current = defaultAppearance;
      setAppearance(defaultAppearance);
      return true;
    }
    const nextAppearance = {
      theme: { ...appearanceRef.current.theme, ...parsedAppearance.theme },
      layout: { ...appearanceRef.current.layout, ...parsedAppearance.layout },
      text: { ...appearanceRef.current.text, ...parsedAppearance.text },
    };
    await AsyncStorage.setItem(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify({ version: 1, ...nextAppearance })
    );
    appearanceRef.current = nextAppearance;
    setAppearance(nextAppearance);
    return false;
  };

  const clearScanHistory = () => {
    triggerHapticFeedback();
    setScans([]);
    showToast('Historique des scans vidé');
  };

  const resetToDefaults = () => {
    triggerHapticFeedback();
    setStudents(INITIAL_STUDENTS);
    setScans(INITIAL_SCANS);
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast('Données réinitialisées');
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const callPhone = (phone) => {
    triggerHapticFeedback();
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            translateText('Appel non disponible'),
            translateText(`Impossible d'appeler le numéro : ${phone}`)
          );
        }
      })
      .catch(() => {
        Alert.alert(
          translateText('Appel non disponible'),
          translateText(`Impossible d'appeler le numéro : ${phone}`)
        );
      });
  };

  const sendEmail = async (email) => {
    triggerHapticFeedback();
    const cleanEmail = email.trim();
    const validEmail =
      /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i.test(
        cleanEmail
      );

    if (!validEmail) {
      Alert.alert(
        translateText('Adresse e-mail invalide'),
        translateText('Aucune adresse e-mail valide n’est enregistrée pour cet élève.')
      );
      return;
    }

    try {
      await ExpoLinking.openURL(`mailto:${encodeURIComponent(cleanEmail)}`);
    } catch (error) {
      console.error('Erreur lors de l’ouverture du client e-mail :', error);
      Alert.alert(
        translateText('E-mail non disponible'),
        translateText('Impossible d’ouvrir une application de messagerie.')
      );
    }
  };

  return (
    <EquipTrackContext.Provider
      value={{
        theme: activeTheme,
        themeSetting,
        colors,
        appearance,
        translateText,
        applyAppearanceConfig,
        students,
        scans,
        notifications,
        unreadNotificationCount,
        settings,
        toastMessage,
        showToast,
        addStudent,
        updateStudentStatus,
        deleteStudent,
        simulateTagScan,
        triggerHapticFeedback,
        setThemeSetting,
        updateSettings,
        clearScanHistory,
        resetToDefaults,
        markNotificationsRead,
        callPhone,
        sendEmail,
      }}>
      {children}
    </EquipTrackContext.Provider>
  );
}

export function useEquipTrack() {
  const ctx = useContext(EquipTrackContext);
  if (!ctx) {
    throw new Error('useEquipTrack must be used within an EquipTrackProvider');
  }
  return ctx;
}
