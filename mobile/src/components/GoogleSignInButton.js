import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

// TODO: Replace these with your Google Cloud Console OAuth client IDs
const GOOGLE_CONFIG = {
  expoClientId: '', // For Expo Go — get from Google Cloud Console
  iosClientId: '',   // For standalone iOS builds
  androidClientId: '', // For standalone Android builds
  webClientId: '',   // Web client ID (also used for ID token verification on backend)
};

export default function GoogleSignInButton() {
  const { googleLogin } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CONFIG.expoClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
  });

  useEffect(() => {
    handleGoogleResponse();
  }, [response]);

  const handleGoogleResponse = async () => {
    if (response?.type !== 'success') return;

    try {
      const { authentication } = response;

      // Send access token to our backend
      await googleLogin({
        accessToken: authentication.accessToken,
        idToken: authentication.idToken,
      });
    } catch (error) {
      Alert.alert('Google Sign-In Failed', error.message);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => promptAsync()}
      disabled={!request}
    >
      {!request ? (
        <ActivityIndicator color={colors.textPrimary} size="small" />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.text}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
