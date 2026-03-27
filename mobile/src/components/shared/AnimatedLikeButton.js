import React, { useRef, useState } from 'react';
import { TouchableWithoutFeedback, Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { createLikeAnimation } from '../../utils/animations';
import { productsAPI } from '../../services/api';

export default function AnimatedLikeButton({ productId, initialLiked = false, size = 24, style }) {
  const [liked, setLiked] = useState(initialLiked);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const particleAnims = useRef(
    Array.from({ length: 6 }, () => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  const handlePress = async () => {
    const newLiked = !liked;
    setLiked(newLiked);

    if (newLiked) {
      // Heart pop
      createLikeAnimation(scaleAnim).start();

      // Burst particles
      const angles = [0, 60, 120, 180, 240, 300];
      const particleAnimations = particleAnims.map((anim, i) => {
        const angle = (angles[i] * Math.PI) / 180;
        const distance = 20 + Math.random() * 10;
        return Animated.parallel([
          Animated.sequence([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim.translateX, {
            toValue: Math.cos(angle) * distance,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: Math.sin(angle) * distance,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
        ]);
      });

      Animated.parallel(particleAnimations).start(() => {
        particleAnims.forEach((anim) => {
          anim.translateX.setValue(0);
          anim.translateY.setValue(0);
        });
      });
    }

    try {
      await productsAPI.like(productId);
    } catch {
      setLiked(!newLiked);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[styles.container, style]}>
        {/* Particles */}
        {particleAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                opacity: anim.opacity,
                transform: [
                  { translateX: anim.translateX },
                  { translateY: anim.translateY },
                  { scale: anim.scale },
                ],
              },
            ]}
          />
        ))}

        {/* Heart */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={size}
            color={liked ? colors.error : colors.textPrimary}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.error,
  },
});
