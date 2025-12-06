import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import CustomButton from '../components/CustomButton';

// Sabitler
const FOCUS_TIME_MINUTES = 25; // 25 Dakika
const INITIAL_TIME = FOCUS_TIME_MINUTES * 60; // Saniye cinsinden

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState('Ders'); // Varsayılan kategori
  const [distractionCount, setDistractionCount] = useState(0); // Şimdilik manuel, sonra otomatik olacak

  // Kategoriler Listesi
  const categories = ["Ders", "Kodlama", "Kitap", "Proje"];

  // Sayaç Mantığı (useEffect)
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      // Sayaç aktifse her 1 saniyede bir azalt
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Süre bittiğinde
      setIsActive(false);
      clearInterval(interval);
      Alert.alert("Tebrikler!", "Odaklanma seansı tamamlandı.");
      // Buraya daha sonra veritabanı kayıt kodu gelecek
    }

    // Temizlik (Component kapanırsa veya durursa interval'i temizle)
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Zamanı Formatlama (Örn: 1500 -> 25:00)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Buton Fonksiyonları
  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(INITIAL_TIME);
    setDistractionCount(0);
  };

  return (
    <View style={styles.container}>
      {/* Üst Başlık */}
      <Text style={styles.headerTitle}>Odaklanma Zamanı</Text>

      {/* Kategori Seçimi */}
      <View style={styles.categoryContainer}>
        <Text style={styles.label}>Kategori Seç:</Text>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <CustomButton
              key={cat}
              title={cat}
              onPress={() => !isActive && setCategory(cat)} // Sayaç çalışırken kategori değişmesin
              color={category === cat ? '#4A90E2' : '#BDC3C7'}
              style={{ minWidth: 70, paddingHorizontal: 10, paddingVertical: 8 }}
            />
          ))}
        </View>
      </View>

      {/* Sayaç Göstergesi */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.statusText}>
          {isActive ? "Odaklanılıyor..." : "Hazır mısın?"}
        </Text>
      </View>

      {/* Kontrol Butonları */}
      <View style={styles.controls}>
        {!isActive ? (
          <CustomButton title="BAŞLAT" onPress={handleStart} color="#2ECC71" />
        ) : (
          <CustomButton title="DURAKLAT" onPress={handlePause} color="#F1C40F" />
        )}
        <CustomButton title="SIFIRLA" onPress={handleReset} color="#E74C3C" />
      </View>

      {/* Geçici Bilgi Gösterimi (Debug için) */}
      <View style={styles.debugInfo}>
        <Text>Seçili Kategori: {category}</Text>
        <Text>Dikkat Dağınıklığı: {distractionCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#34495E',
  },
  categoryContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#7F8C8D',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  timerContainer: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 5,
    borderColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: '#fff',
    elevation: 5, // Android gölge
    shadowColor: '#000', // iOS gölge
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statusText: {
    fontSize: 16,
    color: '#95A5A6',
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  debugInfo: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#ECF0F1',
    borderRadius: 5,
  }
});