import { Animated, Easing } from 'react-native';

// Press-in scale animation for buttons
export const createPressAnimation = (scaleValue) => ({
  onPressIn: () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  },
  onPressOut: () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  },
});

// Heart/like pop animation
export const createLikeAnimation = (scaleValue) => {
  return Animated.sequence([
    Animated.timing(scaleValue, {
      toValue: 1.4,
      duration: 150,
      easing: Easing.out(Easing.back(3)),
      useNativeDriver: true,
    }),
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 80,
      useNativeDriver: true,
    }),
  ]);
};

// Fade in with slide up
export const createFadeInUp = (opacityValue, translateValue, delay = 0) => {
  return Animated.parallel([
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 400,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(translateValue, {
      toValue: 0,
      duration: 500,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);
};

// Stagger children entry
export const createStaggeredEntry = (animations, staggerDelay = 80) => {
  return Animated.stagger(staggerDelay, animations);
};

// Countdown pulse
export const createPulse = (scaleValue, duration = 1000) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.05,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

// Shimmer/skeleton loading
export const createShimmer = (translateValue, width = 300) => {
  return Animated.loop(
    Animated.timing(translateValue, {
      toValue: width,
      duration: 1200,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

// Card tap spring
export const createCardTap = (scaleValue) => {
  return Animated.sequence([
    Animated.timing(scaleValue, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }),
  ]);
};
