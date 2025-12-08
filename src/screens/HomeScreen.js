import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, AppState } from 'react-native'; // AppState eklendi
import CustomButton from '../components/CustomButton';
import { saveSession } from '../storage/storageHelper';
const FOCUS_TIME_MINUTES = 25; 
const INITIAL_TIME = FOCUS_TIME_MINUTES * 60;

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState('Ders');
  const [distractionCount, setDistractionCount] = useState(0);

  // AppState'i takip etmek için ref kullanıyoruz
  const appState = useRef(AppState.currentState);

  const categories = ["Ders", "Kodlama", "Kitap", "Proje"];

  // --- YENİ EKLENEN KISIM BAŞLANGICI (AppState Mantığı) ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      
      // 1. Durum: Uygulama Arka Plana (Background) Geçiyor
      if (
        appState.current.match(/active/) && 
        nextAppState.match(/inactive|background/)
      ) {
        // Eğer sayaç çalışıyorsa durdur ve ceza puanı ekle
        if (isActive) {
          setIsActive(false);
          setDistractionCount(prev => prev + 1);
          console.log("Dikkat dağınıklığı algılandı! Sayaç durdu.");
        }
      }

      // 2. Durum: Uygulama Tekrar Ön Plana (Active) Geliyor
      if (
        appState.current.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        // Eğer süre bitmemişse ve kullanıcı bir seansın ortasındaysa soralım
        if (timeLeft < INITIAL_TIME && timeLeft > 0) {
            Alert.alert(
                "Dikkat Dağınıklığı!",
                "Uygulamadan ayrıldınız. Sayacı devam ettirmek istiyor musunuz?",
                [
                    {
                        text: "Hayır, Bitir",
                        onPress: () => handleReset(), // Sıfırla
                        style: "cancel"
                    },
                    { 
                        text: "Evet, Devam Et", 
                        onPress: () => setIsActive(true) // Kaldığı yerden devam
                    }
                ]
            );
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive, timeLeft]); // isActive ve timeLeft değiştikçe listener güncellenmeli
  // --- YENİ EKLENEN KISIM BİTİŞİ ---

  // Sayaç Mantığı (Eski kodla aynı)
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
	  
	  
      const newSession = {
        id: Date.now().toString(), // Benzersiz ID
        date: new Date().toISOString(), // Şu anki tarih/saat
        duration: FOCUS_TIME_MINUTES, // Odaklanılan süre (dakika)
        category: category, // Seçili kategori
        distractionCount: distractionCount // Yakalanan dikkat dağınıklığı
      };

      saveSession(newSession); // Veritabanına yaz
      // -------------------------------

	  
	  
      Alert.alert("Tebrikler!", "Odaklanma seansı tamamlandı ve kaydedildi.",
	  `Seans tamamlandı ve kaydedildi.\nKategori: ${category}\nDikkat Dağınıklığı: ${distractionCount}`
);
      // Veritabanı kayıt işlemi bir sonraki adımda buraya gelecek
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(INITIAL_TIME);
    setDistractionCount(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Odaklanma Zamanı</Text>

      <View style={styles.categoryContainer}>
        <Text style={styles.label}>Kategori Seç:</Text>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <CustomButton
              key={cat}
              title={cat}
              onPress={() => !isActive && setCategory(cat)}
              color={category === cat ? '#4A90E2' : '#BDC3C7'}
              style={{ minWidth: 70, paddingHorizontal: 10, paddingVertical: 8 }}
            />
          ))}
        </View>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.statusText}>
          {isActive ? "Odaklanılıyor..." : "Hazır mısın?"}
        </Text>
      </View>

      <View style={styles.controls}>
        {!isActive ? (
          <CustomButton title="BAŞLAT" onPress={handleStart} color="#2ECC71" />
        ) : (
          <CustomButton title="DURAKLAT" onPress={handlePause} color="#F1C40F" />
        )}
        <CustomButton title="SIFIRLA" onPress={handleReset} color="#E74C3C" />
      </View>

      {/* Dikkat Dağınıklığı Göstergesi (Test İçin Önemli) */}
      <View style={styles.debugInfo}>
        <Text style={{fontWeight: 'bold'}}>İstatistikler (Canlı):</Text>
        <Text>Kategori: {category}</Text>
        <Text style={{color: 'red'}}>Dikkat Dağınıklığı: {distractionCount}</Text>
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
    elevation: 5,
    shadowColor: '#000',
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
    padding: 15,
    backgroundColor: '#ECF0F1',
    borderRadius: 5,
    width: '90%',
    alignItems: 'center'
  }
});