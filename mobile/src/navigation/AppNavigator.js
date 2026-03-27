import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

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

// Fashion screens
import FashionShopScreen from '../screens/fashion/FashionShopScreen';
import FashionProductScreen from '../screens/fashion/FashionProductScreen';

// Food screens
import FoodShopScreen from '../screens/food/FoodShopScreen';
import FoodProductScreen from '../screens/food/FoodProductScreen';

// Handcraft screens
import HandcraftShopScreen from '../screens/handcraft/HandcraftShopScreen';
import HandcraftProductScreen from '../screens/handcraft/HandcraftProductScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.beigeLight,
  },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: {
    fontWeight: '600',
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
          else if (route.name === 'NearMe') iconName = focused ? 'location' : 'location-outline';
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
      <Tab.Screen name="NearMe" component={NearMeScreen} options={{ title: 'Near Me' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
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
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
            <Stack.Screen name="ShopDetail" component={ShopDetailScreen} options={{ title: '' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
            <Stack.Screen name="CreateShop" component={CreateShopScreen} options={{ title: 'Create Your Shop' }} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Add Product' }} />
            <Stack.Screen name="CustomOrder" component={CustomOrderScreen} options={{ title: 'Custom Order' }} />

            {/* Fashion screens */}
            <Stack.Screen
              name="FashionShop"
              component={FashionShopScreen}
              options={{
                headerShown: false,
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="FashionProduct"
              component={FashionProductScreen}
              options={{
                title: '',
                headerTransparent: true,
                headerTintColor: colors.white,
              }}
            />

            {/* Food screens */}
            <Stack.Screen
              name="FoodShop"
              component={FoodShopScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="FoodProduct"
              component={FoodProductScreen}
              options={{
                title: '',
                headerTransparent: true,
              }}
            />

            {/* Handcraft screens */}
            <Stack.Screen
              name="HandcraftShop"
              component={HandcraftShopScreen}
              options={{
                headerShown: false,
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="HandcraftProduct"
              component={HandcraftProductScreen}
              options={{
                title: '',
                headerTransparent: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
