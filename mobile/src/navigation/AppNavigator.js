import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
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

const TAB_ICONS = {
  Home: ['home', 'home-outline'],
  Search: ['search', 'search-outline'],
  Orders: ['receipt', 'receipt-outline'],
  Messages: ['chatbubbles', 'chatbubbles-outline'],
  Profile: ['person', 'person-outline'],
};

const TAB_LABELS = {
  Home: 'home',
  Search: 'search',
  Orders: 'orders',
  Messages: 'messages',
  Profile: 'profile',
};

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 5);

  return (
    <View style={[tabBarStyles.container, { paddingBottom: bottomPadding }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const [activeIcon, inactiveIcon] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => {
              if (!isFocused) {
                navigation.navigate(route.name);
              }
            }}
            style={tabBarStyles.tab}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFocused ? activeIcon : inactiveIcon}
              size={24}
              color={isFocused ? colors.terracotta : colors.textLight}
            />
            <Text style={[
              tabBarStyles.label,
              { color: isFocused ? colors.terracotta : colors.textLight },
            ]}>
              {t(TAB_LABELS[route.name])}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8D4BD',
    paddingTop: 8,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});

function HomeTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
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
  const { t } = useLanguage();

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
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: t('chat') }} />
          <Stack.Screen name="CreateShop" component={CreateShopScreen} options={{ title: t('createYourShop') }} />
          <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: t('addProduct') }} />
          <Stack.Screen name="CustomOrder" component={CustomOrderScreen} options={{ title: t('customOrder') }} />
          <Stack.Screen name="ManageShop" component={ManageShopScreen} options={{ title: t('myShop') }} />
          <Stack.Screen name="EditProduct" component={EditProductScreen} options={{ title: t('editProductTitle') }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: t('editProfileTitle') }} />
          <Stack.Screen name="NearMe" component={NearMeScreen} options={{ title: t('nearMe') }} />

          {/* Admin screens */}
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} options={{ title: t('adminPanel') }} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: t('manageUsers') }} />
          <Stack.Screen name="AdminShops" component={AdminShopsScreen} options={{ title: t('manageShops') }} />
          <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: t('manageProducts') }} />
          <Stack.Screen name="AdminMessages" component={AdminMessagesScreen} options={{ title: t('manageMessages') }} />

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
