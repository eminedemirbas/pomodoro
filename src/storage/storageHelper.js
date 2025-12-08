import AsyncStorage from '@react-native-async-storage/async-storage';

// Verilerin kaydedileceği anahtar kelime
const SESSION_KEY = '@sessions_data';

/**
 * Yeni bir odaklanma seansını kaydeder.
 * @param {object} session - { id, date, duration, category, distractionCount }
 */
export const saveSession = async (session) => {
  try {
    // 1. Mevcut verileri çek
    const existingData = await AsyncStorage.getItem(SESSION_KEY);
    let sessions = existingData ? JSON.parse(existingData) : [];

    // 2. Yeni seansı listeye ekle
    sessions.push(session);

    // 3. Güncellenmiş listeyi tekrar kaydet
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
    console.log('Seans başarıyla kaydedildi:', session);
  } catch (e) {
    console.error('Kaydetme hatası:', e);
  }
};

/**
 * Kayıtlı tüm seansları getirir.
 */
export const getSessions = async () => {
  try {
    const data = await AsyncStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Veri çekme hatası:', e);
    return [];
  }
};

/**
 * (Geliştirme aşaması için) Tüm verileri siler.
 */
export const clearSessions = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
    console.log('Tüm veriler temizlendi.');
  } catch (e) {
    console.error('Silme hatası:', e);
  }
};