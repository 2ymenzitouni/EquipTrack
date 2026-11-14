import { Platform } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

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
  let scanError;

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
  } catch (error) {
    scanError = error;
    throw error;
  } finally {
    if (requestAttempted) {
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (cleanupError) {
        console.error('Erreur lors de la fermeture de la session NFC :', cleanupError);
        if (!scanError) throw cleanupError;
      }
    }
  }
}

export async function readNdefText() {
  let requestAttempted = false;
  let scanError;

  try {
    await NfcManager.start();
    if (!(await NfcManager.isSupported())) {
      throw new Error('NFC_UNSUPPORTED');
    }

    requestAttempted = true;
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'Approchez le tag NFC du téléphone.',
    });

    const tag = await NfcManager.getTag();
    const textRecord = tag?.ndefMessage?.find((record) =>
      Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)
    );
    if (!textRecord) {
      throw new Error('NFC_NDEF_TEXT_UNAVAILABLE');
    }

    return Ndef.text.decodePayload(Uint8Array.from(textRecord.payload));
  } catch (error) {
    scanError = error;
    throw error;
  } finally {
    if (requestAttempted) {
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (cleanupError) {
        console.error('Erreur lors de la fermeture de la session NFC :', cleanupError);
        if (!scanError) throw cleanupError;
      }
    }
  }
}
