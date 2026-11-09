import { Platform } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

const NFC_TECHNOLOGIES = {
  ios: [
    NfcTech.NfcA,
    NfcTech.NfcV,
    NfcTech.IsoDep,
    NfcTech.MifareIOS,
    NfcTech.Iso15693IOS,
    NfcTech.FelicaIOS,
  ],
  android: [
    NfcTech.NfcA,
    NfcTech.NfcB,
    NfcTech.NfcF,
    NfcTech.NfcV,
    NfcTech.IsoDep,
    NfcTech.MifareClassic,
    NfcTech.MifareUltralight,
    NfcTech.Ndef,
    NfcTech.NdefFormatable,
  ],
};

export async function readNfcTagId() {
  let requestAttempted = false;
  try {
    await NfcManager.start();
    if (!(await NfcManager.isSupported())) {
      throw new Error('NFC_UNSUPPORTED');
    }

    requestAttempted = true;
    await NfcManager.requestTechnology(NFC_TECHNOLOGIES[Platform.OS], {
      alertMessage: 'Approchez le tag NFC du téléphone.',
    });

    const tag = await NfcManager.getTag({ readNdef: false });
    if (!tag?.id) {
      throw new Error('NFC_TAG_ID_UNAVAILABLE');
    }
    return tag.id.toUpperCase();
  } finally {
    if (requestAttempted) {
      await NfcManager.cancelTechnologyRequest({ throwOnError: true });
    }
  }
}
