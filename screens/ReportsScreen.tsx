import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const PADDING = 16;

const COLORS = {
  primary: '#5B5FFF',
  primaryLight: '#E0E7FF',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
  green: '#10B981',
  greenLight: '#D1FAE5',
  red: '#EF4444',
  redLight: '#FEE2E2',
  blue: '#3B82F6',
  blueLight: '#DBEAFE',
  orange: '#F97316',
  orangeLight: '#FFEDD5',
  pink: '#EC4899',
  pinkLight: '#FCE7F3',
};

interface ReportCard {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  color: string;
  lightColor: string;
}

interface ReportItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

const reportCards: ReportCard[] = [
  {
    id: '1',
    title: 'Doanh thu hôm nay',
    value: '0 ₫',
    change: '0% so với hôm qua',
    isPositive: true,
    icon: 'trending-up',
    color: COLORS.green,
    lightColor: COLORS.greenLight,
  },
  {
    id: '2',
    title: 'Đơn hàng hôm nay',
    value: '0',
    change: '0 đơn mới',
    isPositive: true,
    icon: 'shopping-cart',
    color: COLORS.blue,
    lightColor: COLORS.blueLight,
  },
  {
    id: '3',
    title: 'Tồn kho',
    value: '0 SP',
    change: 'Tổng giá trị',
    isPositive: false,
    icon: 'package-multiple',
    color: COLORS.orange,
    lightColor: COLORS.orangeLight,
  },
  {
    id: '4',
    title: 'Khách hàng',
    value: '0',
    change: 'hôm nay',
    isPositive: true,
    icon: 'account-multiple',
    color: COLORS.pink,
    lightColor: COLORS.pinkLight,
  },
];

const topProducts: ReportItem[] = [
  {
    id: '1',
    name: 'Laptop Dell XPS 13',
    quantity: 5,
    revenue: 125000000,
    percentage: 35,
  },
  {
    id: '2',
    name: 'iPhone 15 Pro Max',
    quantity: 3,
    revenue: 105000000,
    percentage: 30,
  },
  {
    id: '3',
    name: 'Samsung Galaxy S24',
    quantity: 4,
    revenue: 88000000,
    percentage: 25,
  },
  {
    id: '4',
    name: 'iPad Air M2',
    quantity: 2,
    revenue: 36000000,
    percentage: 10,
  },
];

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K';
    }
    return amount.toString();
  };

  const ReportCardComponent = ({ card }: { card: ReportCard }) => (
    <TouchableOpacity activeOpacity={0.8} style={styles.reportCardWrapper}>
      <View style={[styles.reportCard, { borderColor: card.lightColor }]}>
        <View style={styles.cardIconContainer}>
          <View style={[styles.cardIconBg, { backgroundColor: card.lightColor }]}>
            <MaterialCommunityIcons
              name={card.icon as any}
              size={26}
              color={card.color}
            />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <View style={styles.changeTag}>
              <MaterialCommunityIcons
                name={card.isPositive ? 'trending-up' : 'trending-down'}
                size={12}
                color={card.isPositive ? COLORS.green : COLORS.red}
              />
              <Text
                style={[
                  styles.cardChange,
                  { color: card.isPositive ? COLORS.green : COLORS.red },
                ]}
              >
                {card.change}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.cardValue}>{card.value}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Chọn thời gian */}
        <View style={styles.periodSelector}>
          {['today', 'week', 'month'].map((period, index) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'today'
                  ? 'Hôm nay'
                  : period === 'week'
                  ? 'Tuần'
                  : 'Tháng'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Các thẻ báo cáo - 2x2 grid */}
        <View style={styles.reportsGrid}>
          {reportCards.map((card) => (
            <View key={card.id} style={styles.cardColumn}>
              <ReportCardComponent card={card} />
            </View>
          ))}
        </View>

        {/* Sản phẩm bán chạy nhất */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🔥 Sản phẩm bán chạy</Text>
              <Text style={styles.sectionSubtitle}>Top 4 sản phẩm bán chạy nhất</Text>
            </View>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={topProducts}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.productItemWrapper}>
                <View style={styles.productRank}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.productContent}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productSubtitle}>
                      {item.quantity} sản phẩm • {formatCurrency(item.revenue)} ₫
                    </Text>
                  </View>
                  <View style={styles.productRight}>
                    <View style={styles.productProgress}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${item.percentage}%`,
                            backgroundColor:
                              index === 0
                                ? COLORS.green
                                : index === 1
                                ? COLORS.blue
                                : index === 2
                                ? COLORS.orange
                                : COLORS.pink,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.percentageText}>{item.percentage}%</Text>
                  </View>
                </View>
              </View>
            )}
          />
        </View>

        {/* Thống kê chi tiết */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>📊 Thống kê chi tiết</Text>
              <Text style={styles.sectionSubtitle}>Tổng quan kho hàng</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { borderLeftColor: COLORS.green }]}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.greenLight }]}>
                <MaterialCommunityIcons
                    name="cube-outline"
                  size={22}
                  color={COLORS.green}
                />
              </View>
              <Text style={styles.statLabel}>Tổng sản phẩm</Text>
              <Text style={styles.statValue}>320</Text>
            </View>

            <View style={[styles.statItem, { borderLeftColor: COLORS.blue }]}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.blueLight }]}>
                <MaterialCommunityIcons
                  name="warehouse"
                  size={22}
                  color={COLORS.blue}
                />
              </View>
              <Text style={styles.statLabel}>Tồn kho</Text>
              <Text style={styles.statValue}>850</Text>
            </View>

            <View style={[styles.statItem, { borderLeftColor: COLORS.orange }]}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.orangeLight }]}>
                <MaterialCommunityIcons
                  name="percent"
                  size={22}
                  color={COLORS.orange}
                />
              </View>
              <Text style={styles.statLabel}>Tỷ lệ bán</Text>
              <Text style={styles.statValue}>62%</Text>
            </View>
          </View>
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: PADDING,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: PADDING,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  periodButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray600,
    textAlign: 'center',
  },
  periodButtonTextActive: {
    color: COLORS.white,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: PADDING,
    paddingVertical: 12,
    gap: 12,
  },
  cardColumn: {
    width: '48%',
  },
  reportCardWrapper: {
    marginBottom: 4,
  },
  reportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
  },
  cardIconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: 4,
  },
  changeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardChange: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    paddingHorizontal: PADDING,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.gray800,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.gray600,
    marginTop: 2,
  },
  productItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  productContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 11,
    color: COLORS.gray600,
  },
  productRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  productProgress: {
    width: 80,
    height: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsGrid: {
    gap: 12,
  },
  statItem: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray800,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray800,
  },
});