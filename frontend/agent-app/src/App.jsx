// ═══════════════════════════════════════════════════════════════════════════
// Agent App — Main Component (React Native)
// ═══════════════════════════════════════════════════════════════════════════
// Replaces payloom-agent.jsx with proper React Native setup

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const Tab = createBottomTabNavigator();

// ───────────────────────────────────────────────────────────────────────────
// Home Screen — Agent Dashboard
// ───────────────────────────────────────────────────────────────────────────
function HomeScreen() {
  const [stats, setStats] = useState(null);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // TODO: Get auth token from secure storage
      // const token = await getAuthToken();
      // const headers = { Authorization: `Bearer ${token}` };
      
      // Load analytics
      // const analyticsRes = await axios.get(`${API_URL}/analytics/agent`, { headers });
      // setStats(analyticsRes.data);
      
      // Load earnings
      // const earningsRes = await axios.get(`${API_URL}/payouts/earnings`, { headers });
      // setPendingEarnings(earningsRes.data.pending_earnings);
      // setTotalEarnings(earningsRes.data.total_paid);

      // Mock data for demo
      setStats({
        total_orders: 58,
        delivered_orders: 45,
        total_sales: 42650,
        unique_customers: 32,
        avg_rating: 4.8
      });
      setPendingEarnings(4572);
      setTotalEarnings(42650);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.logoArea}>
          <View style={styles.avatar}>AK</View>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.agentName}>Amara Kamau</Text>
          </View>
          <View style={styles.tier}>
            <Text style={styles.tierText}>Gold Agent</Text>
          </View>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Pending Earnings</Text>
        <Text style={styles.balanceAmt}>KSh {pendingEarnings.toLocaleString()}</Text>
        <Text style={styles.balanceSub}>Commission rate: 12% per sale</Text>
        <TouchableOpacity style={styles.requestBtn}>
          <Text style={styles.requestBtnText}>Request Payout via M-Pesa →</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF4D00" />
      ) : (
        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#00D97E' }]}>
              KSh {stats.total_sales.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Earned</Text>
            <Text style={[styles.statChange, { color: '#00D97E' }]}>↑ 18% this month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FFD600' }]}>{stats.total_orders}</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
            <Text style={[styles.statChange, { color: '#FFD600' }]}>↑ 7 this week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#00B4FF' }]}>
              ⭐ {stats.avg_rating}
            </Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
            <Text style={[styles.statChange, { color: '#00B4FF' }]}>From {stats.unique_customers} customers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FF4D00' }]}>4</Text>
            <Text style={styles.statLabel}>Active Products</Text>
            <Text style={[styles.statChange, { color: '#666' }]}>1 out of stock</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Products Screen
// ───────────────────────────────────────────────────────────────────────────
function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // TODO: Fetch products from API
      // const token = await getAuthToken();
      // const response = await axios.get(`${API_URL}/products/agent/products`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setProducts(response.data.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Products</Text>
      <Text style={styles.screenSubtitle}>Share your link to get sales</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#FF4D00" />
      ) : products.length === 0 ? (
        <Text style={styles.emptyText}>No products yet. Create one to start!</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.productRow}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>KSh {item.price.toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Orders Screen
// ───────────────────────────────────────────────────────────────────────────
function OrdersScreen() {
  const [orders, setOrders] = useState([]);

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Orders</Text>
      <Text style={styles.screenSubtitle}>All customer orders from your links</Text>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>No orders yet</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderRow}>
              <Text>{item.product}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Payouts Screen
// ───────────────────────────────────────────────────────────────────────────
function PayoutsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Payouts</Text>
      <Text style={styles.placeholder}>Payout history coming soon...</Text>
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Main App Navigation
// ───────────────────────────────────────────────────────────────────────────
export default function AgentApp() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#FF4D00',
          tabBarInactiveTintColor: '#3A3A4A',
          headerShown: false,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚡</Text>,
          }}
        />
        <Tab.Screen
          name="Products"
          component={ProductsScreen}
          options={{
            tabBarLabel: 'Products',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📦</Text>,
          }}
        />
        <Tab.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            tabBarLabel: 'Orders',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🧾</Text>,
          }}
        />
        <Tab.Screen
          name="Payouts"
          component={PayoutsScreen}
          options={{
            tabBarLabel: 'Payouts',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💸</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Styles
// ───────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C10',
  },
  topBar: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C24',
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'linear-gradient(135deg,#FF4D00,#FF8C00)',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '900',
    fontSize: 15,
    color: '#fff',
  },
  greeting: {
    fontSize: 13,
    color: '#666',
  },
  agentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F0EEF8',
  },
  tier: {
    marginLeft: 'auto',
    backgroundColor: '#1A1000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFD700',
  },
  balanceCard: {
    backgroundColor: '#16161E',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3D1F00',
  },
  balanceLabel: {
    fontSize: 11,
    color: '#FF8C5A',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  balanceAmt: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginTop: 6,
    marginBottom: 2,
  },
  balanceSub: {
    fontSize: 12,
    color: '#AA7755',
  },
  requestBtn: {
    marginTop: 14,
    backgroundColor: '#FF4D00',
    borderRadius: 12,
    paddingVertical: 12,
  },
  requestBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#16161E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginTop: 2,
  },
  statChange: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F0EEF8',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#555',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    padding: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  productRow: {
    backgroundColor: '#16161E',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F0EEF8',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00D97E',
    marginTop: 4,
  },
  orderRow: {
    backgroundColor: '#16161E',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tabBar: {
    backgroundColor: '#0C0C10',
    borderTopColor: '#1C1C24',
  },
});
