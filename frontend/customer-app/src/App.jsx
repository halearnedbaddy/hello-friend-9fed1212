// ═══════════════════════════════════════════════════════════════════════════
// Customer App — Main Component (React Native)
// ═══════════════════════════════════════════════════════════════════════════
// This replaces the payloom-shop.jsx file with proper React Native structure

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert, Button } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ───────────────────────────────────────────────────────────────────────────
// Home Screen
// ───────────────────────────────────────────────────────────────────────────
function HomeScreen({ navigation, addToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [activeCategory, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`, {
        params: {
          category: activeCategory,
          search: searchQuery,
          limit: 20
        }
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/categories/list`);
      setCategories(['All', ...response.data.map(c => c.name)]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <View style={styles.logoBox}>P</View>
            <View>
              <Text style={styles.logoText}>PayLoom</Text>
              <Text style={styles.logoSub}>Instants Shop</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Hero Section */}
        <View style={styles.heroStrip}>
          <Text style={styles.heroTitle}>Shop. Pay. Done.{'\n'}Instantly.</Text>
          <Text style={styles.heroSub}>Pay with M-Pesa · Delivered to your door</Text>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryBtn,
                activeCategory === category && styles.categoryBtnActive
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category && styles.categoryTextActive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF4D00" />
        ) : (
          <View style={styles.grid}>
            {products.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product })}
              >
                <View style={styles.productImage}>{product.image_emoji}</View>
                <View style={styles.productBody}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productAgent}>by {product.agent || 'Unknown'}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>KSh {product.price.toLocaleString()}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => {
                      addToCart({ ...product, qty: 1 });
                      Alert.alert('Added', `${product.name} added to cart`);
                    }}
                  >
                    <Text style={styles.addBtnText}>+ Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Cart Screen
// ───────────────────────────────────────────────────────────────────────────
function CartScreen({ navigation, cart, onRemove }) {
  const total = cart.reduce((s, i) => s + (i.qty || 1) * i.price, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Cart</Text>
      {cart.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyText}>🛒 Your cart is empty</Text>
          <Text style={styles.emptySubText}>Add items to get started</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Text style={styles.cartItemName}>{item.name} x{item.qty || 1}</Text>
                <Text style={styles.cartItemPrice}>KSh {((item.qty || 1) * item.price).toLocaleString()}</Text>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TouchableOpacity onPress={() => onRemove(item.id)} style={{ marginRight: 8 }}>
                    <Text style={{ color: '#FF4D00' }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Total: KSh {total.toLocaleString()}</Text>
            <Button title="Checkout (M-Pesa)" color="#FF4D00" onPress={() => navigation.navigate('Checkout', { total })} />
          </View>
        </View>
      )}
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Profile Screen
// ───────────────────────────────────────────────────────────────────────────
function ProfileScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // TODO: Get auth token from secure storage
      // const token = await getAuthToken();
      // const response = await axios.get(`${API_URL}/auth/profile`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setUser(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Profile</Text>
      <Text style={styles.placeholder}>Profile screen coming soon...</Text>
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Main App Navigation
// ───────────────────────────────────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────
// Product Detail
// ───────────────────────────────────────────────────────────────────────────
function ProductDetailScreen({ route, navigation, addToCart }) {
  const { product } = route.params || {};

  if (!product) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>{product.name}</Text>
      <View style={{ padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>{product.description}</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#FF4D00' }}>KSh {product.price.toLocaleString()}</Text>
        <View style={{ marginTop: 16 }}>
          <Button title="Add to Cart" color="#0A0A0A" onPress={() => { addToCart({ ...product, qty: 1 }); navigation.navigate('CartTab'); }} />
        </View>
      </View>
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Checkout Screen (initiates M-Pesa STK Push)
// ───────────────────────────────────────────────────────────────────────────
function CheckoutScreen({ route, navigation }) {
  const { total } = route.params || { total: 0 };
  const [phone, setPhone] = useState('2547');
  const [loading, setLoading] = useState(false);

  const doStk = async () => {
    try {
      setLoading(true);
      const orderId = `local-${Date.now().toString(36)}`;
      const res = await axios.post(`${API_URL}/payments/mpesa/stk-push`, {
        phone,
        amount: Math.ceil(total),
        orderId,
        description: 'PayLoom order',
      });

      const data = res.data;
      Alert.alert('STK Initiated', data.customerMessage || 'Check your phone for the M-Pesa prompt');
      navigation.navigate('PaymentStatus', { checkoutRequestId: data.checkoutRequestId, orderId });
    } catch (err) {
      console.error('STK error', err?.response?.data || err.message);
      Alert.alert('Payment Error', err?.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Checkout</Text>
      <View style={{ padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>Total: KSh {Math.ceil(total).toLocaleString()}</Text>
        <TextInput value={phone} onChangeText={setPhone} style={[styles.searchInput, { marginBottom: 12 }]} keyboardType="phone-pad" />
        <Button title={loading ? 'Processing...' : 'Pay with M-Pesa'} color="#FF4D00" onPress={doStk} disabled={loading} />
      </View>
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Payment Status Screen (polls backend for STK result)
// ───────────────────────────────────────────────────────────────────────────
function PaymentStatusScreen({ route, navigation }) {
  const { checkoutRequestId, orderId } = route.params || {};
  const [status, setStatus] = useState('pending');
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!polling) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/payments/status/${checkoutRequestId}`);
        setStatus(res.data.status);
        if (res.data.status === 'completed' || res.data.status === 'failed') {
          setPolling(false);
        }
      } catch (err) {
        console.error('Poll error', err.message);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [polling, checkoutRequestId]);

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Payment Status</Text>
      <View style={{ alignItems: 'center', paddingTop: 60 }}>
        {status === 'pending' && (
          <>
            <ActivityIndicator size="large" color="#FF4D00" />
            <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '700' }}>Awaiting payment confirmation...</Text>
            <Text style={{ marginTop: 8, color: '#999' }}>This may take a few seconds</Text>
          </>
        )}
        {status === 'completed' && (
          <>
            <Text style={{ fontSize: 48 }}>✅</Text>
            <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '700' }}>Payment successful!</Text>
            <Button title="Continue Shopping" onPress={() => navigation.navigate('Main')} color="#FF4D00" />
          </>
        )}
        {status === 'failed' && (
          <>
            <Text style={{ fontSize: 48 }}>❌</Text>
            <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '700' }}>Payment failed</Text>
            <Button title="Try again" onPress={() => navigation.goBack()} color="#FF4D00" />
          </>
        )}
      </View>
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Main App Navigation (Stack + Tabs) with Cart Persistence
// ───────────────────────────────────────────────────────────────────────────
export default function CustomerApp() {
  const [cart, setCart] = useState([]);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const saved = await AsyncStorage.getItem('paylooom_cart');
        if (saved) setCart(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    };
    loadCart();
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('paylooom_cart', JSON.stringify(cart));
      } catch (err) {
        console.error('Failed to save cart:', err);
      }
    };
    saveCart();
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.map((p) => p.id === product.id ? { ...p, qty: (p.qty || 1) + (product.qty || 1) } : p);
      return [...prev, { ...product }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((p) => p.id !== id));

  const MainTabs = ({ navigation }) => (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF4D00',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        children={(props) => <HomeScreen {...props} navigation={navigation} addToCart={addToCart} />}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="CartTab"
        children={(props) => <CartScreen {...props} cart={cart} onRemove={removeFromCart} />}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen name="ProductDetail">
          {(props) => <ProductDetailScreen {...props} addToCart={addToCart} />}
        </Stack.Screen>
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Styles
// ───────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EF',
  },
  header: {
    backgroundColor: '#0A0A0A',
    padding: 20,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 36,
    height: 36,
    backgroundColor: '#FF4D00',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  logoSub: {
    color: '#FF4D00',
    fontSize: 11,
    fontWeight: '600',
  },
  searchBar: {
    backgroundColor: '#0A0A0A',
    padding: 14,
  },
  searchInput: {
    backgroundColor: '#1A1A1A',
    color: '#fff',
    padding: 10,
    borderRadius: 12,
  },
  heroStrip: {
    backgroundColor: '#FF4D00',
    padding: 20,
    marginTop: 10,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryBtn: {
    backgroundColor: '#fff',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#E8E4DD',
  },
  categoryBtnActive: {
    backgroundColor: '#0A0A0A',
  },
  categoryText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  productImage: {
    backgroundColor: '#F7F4EF',
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 52,
  },
  productBody: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A0A0A',
    marginBottom: 4,
  },
  productAgent: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  priceRow: {
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF4D00',
  },
  addBtn: {
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    padding: 6,
    marginTop: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A0A0A',
    padding: 20,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A0A0A',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  cartItem: {
    backgroundColor: '#fff',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF4D00',
    marginTop: 8,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
});
