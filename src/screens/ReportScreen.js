import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getSessions } from '../storage/storageHelper';

const screenWidth = Dimensions.get("window").width;

export default function ReportScreen() {
  const [stats, setStats] = useState({
    todayFocus: 0,
    totalFocus: 0,
    totalDistractions: 0,
  });
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const sessions = await getSessions();
    processStats(sessions);
  };

  const processStats = (sessions) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let totalDur = 0;
    let todayDur = 0;
    let totalDis = 0;
    const categoryMap = {};
    const last7DaysMap = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7DaysMap[dateStr] = 0;
    }

    // Tüm seansları döngüye al ve hesapla
    sessions.forEach(session => {
      const sessionDateStr = session.date.split('T')[0];
      
      // 1. Genel İstatistikler
      totalDur += session.duration;
      totalDis += session.distractionCount;

      if (sessionDateStr === todayStr) {
        todayDur += session.duration;
      }

      // 2. Kategori Verisi (Pasta Grafik)
      if (categoryMap[session.category]) {
        categoryMap[session.category] += session.duration;
      } else {
        categoryMap[session.category] = session.duration;
      }

      // 3. Günlük Veri (Çubuk Grafik)
      if (last7DaysMap.hasOwnProperty(sessionDateStr)) {
        last7DaysMap[sessionDateStr] += session.duration;
      }
    });

    // State'leri Güncelle

    // Genel İstatistikler
    setStats({
      todayFocus: Math.round(todayDur),
      totalFocus: Math.round(totalDur),
      totalDistractions: totalDis
    });

    // Pasta Grafik Verisi Hazırlama
    const colors = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6'];
    const pData = Object.keys(categoryMap).map((cat, index) => ({
      name: cat,
      population: Math.round(categoryMap[cat]),
      color: colors[index % colors.length],
      legendFontColor: "#7F8C8D",
      legendFontSize: 12
    }));
    setPieData(pData);

    // Çubuk Grafik Verisi Hazırlama
    const bLabels = Object.keys(last7DaysMap).map(date => date.substring(5)); // Sadece MM-DD al
    const bValues = Object.values(last7DaysMap);
    
    setBarData({
      labels: bLabels,
      datasets: [{ data: bValues }]
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Raporlar ve Analiz</Text>

      {/* Kartlar: Genel İstatistikler */}
      <View style={styles.statsContainer}>
        <View style={[styles.card, { backgroundColor: '#E8F6F3' }]}>
          <Text style={styles.cardTitle}>Bugün</Text>
          <Text style={[styles.cardValue, { color: '#1ABC9C' }]}>{stats.todayFocus} dk</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#EBF5FB' }]}>
          <Text style={styles.cardTitle}>Toplam</Text>
          <Text style={[styles.cardValue, { color: '#3498db' }]}>{stats.totalFocus} dk</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#FDEDEC' }]}>
          <Text style={styles.cardTitle}>Dikkat Dağ.</Text>
          <Text style={[styles.cardValue, { color: '#E74C3C' }]}>{stats.totalDistractions}</Text>
        </View>
      </View>

      {/* Grafik 1: Son 7 Gün (Çubuk) */}
      <Text style={styles.chartTitle}>Son 7 Gün Odaklanma (Dk)</Text>
      {barData.datasets[0].data.length > 0 && (
        <BarChart
          data={barData}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix="dk"
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={styles.chart}
        />
      )}

      {/* Grafik 2: Kategori Dağılımı (Pasta) */}
      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
      {pieData.length > 0 ? (
        <PieChart
          data={pieData}
          width={screenWidth - 20}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      ) : (
        <Text style={styles.noDataText}>Henüz veri yok.</Text>
      )}
      
      <View style={{ height: 50 }} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    width: '30%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
    color: '#34495E',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#95A5A6',
    marginTop: 20,
    fontStyle: 'italic',
  }
});