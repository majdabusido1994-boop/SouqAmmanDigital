import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import SplashScreen from '../screens/SplashScreen';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main screens
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import ShopDetailScreen from '../screens/main/ShopDetailScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CreateShopScreen from '../screens/main/CreateShopScreen';
import AddProductScreen from '../screens/main/AddProductScreen';
import CustomOrderScreen from '../screens/main/CustomOrderScreen';
import NearMeScreen from '../screens/main/NearMeScreen';
import ManageShopScreen from '../screens/main/ManageShopScreen';
import EditProductScreen from '../screens/main/EditProductScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import OrdersScreen from '../screens/main/OrdersScreen';

// Fashion screens
import FashionShopScreen from '../screens/fashion/FashionShopScreen';
import FashionProductScreen from '../screens/fashion/FashionProductScreen';

// Food screens
import FoodShopScreen from '../screens/food/FoodShopScreen';
import FoodProductScreen from '../screens/food/FoodProductScreen';

// Handcraft screens
import HandcraftShopScreen from '../screens/handcraft/HandcraftShopScreen';
import HandcraftProductScreen from '../screens/handcraft/HandcraftProductScreen';

// Admin screens
import AdminPanelScreen from '../screens/admin/AdminPanelScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminShopsScreen from '../screens/admin/AdminShopsScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminMessagesScreen from '../screens/admin/AdminMessagesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.beigeLight || '#FAF3EB',
  },
  headerTintColor: colors.terracottaDark || '#A55D2B',
  headerTitleStyle: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: colors.background,
  },
  animation: 'slide_from_right',
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Messages') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.terracotta,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={HomeTabs} options={{ headerShown: false }} />

          {/* Generic screens */}
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '', headerTransparent: true, headerTintColor: colors.terracottaDark || '#A55D2B' }} />
          <Stack.Screen name="ShopDetail" component={ShopDetailScreen} options={{ title: '', headerTransparent: true, headerTintColor: colors.terracottaDark || '#A55D2B' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
          <Stack.Screen name="CreateShop" component={CreateShopScreen} options={{ title: 'Create Your Shop' }} />
          <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Add Product' }} />
          <Stack.Screen name="CustomOrder" component={CustomOrderScreen} options={{ title: 'Custom Order' }} />
          <Stack.Screen name="ManageShop" component={ManageShopScreen} options={{ title: 'My Shop' }} />
          <Stack.Screen name="EditProduct" component={EditProductScreen} options={{ title: 'Edit Product' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
          <Stack.Screen name="NearMe" component={NearMeScreen} options={{ title: 'Near Me' }} />

          {/* Admin screens */}
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} options={{ title: 'Admin Panel' }} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Manage Users' }} />
          <Stack.Screen name="AdminShops" component={AdminShopsScreen} options={{ title: 'Manage Shops' }} />
          <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: 'Manage Products' }} />
          <Stack.Screen name="AdminMessages" component={AdminMessagesScreen} options={{ title: 'Messages' }} />

          {/* Fashion screens */}
          <Stack.Screen
            name="FashionShop"
            component={FashionShopScreen}
            options={{
              title: '',
              headerTransparent: true,
              headerTintColor: colors.terracottaDark || '#A55D2B',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="FashionProduct"
            component={FashionProductScreen}
            options={{
              title: '',
              headerTransparent: true,
              headerTintColor: colors.terracottaDark || '#A55D2B',
            }}
          />

          {/* Food screens */}
          <Stack.Screen
            name="FoodShop"
            component={FoodShopScreen}
            options={{
              title: '',
              headerTransparent: true,
              headerTintColor: colors.terracottaDark || '#A55D2B',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="FoodProduct"
            component={FoodProductScreen}
            options={{
              title: '',
              headerTransparent: true,
              headerTintColor: colors.terracottaDark || '#A55D2B',
            }}
          />

          {/* Handcraft screens */}
          <Stack.Screen
            name="HandcraftShop"
            component={HandcraftShopScreen}
            options={{
              title: '',
              headerTransparent: true,
              headerTintColor: colors.terracottaDark || '#A55D2B',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="HandcraftProduct"
            component={HandcraftProductScreen}
            options={{
              title: '',
              headerTransparent: true,
              headerTintColor: colors.terracottaDark || '#A55D2B',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
