import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { createPressAnimation } from '../../utils/animations';

export default function AnimatedButton({ onPress, style, children, disabled }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressHandlers = createPressAnimation(scaleAnim);

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={pressHandlers.onPressIn}
      onPressOut={pressHandlers.onPressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          style,
          { transform: [{ scale: scaleAnim }] },
          disabled && styles.disabled,
        ]}
      >
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.6,
  },
});
