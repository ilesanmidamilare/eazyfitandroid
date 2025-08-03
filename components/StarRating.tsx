import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type StarRatingProps = {
  rating: number; // 0 to 5, can include half like 3.5
  size?: number;
  color?: string;
};

const StarRating = ({ rating, size = 24, color = '#EEC800' }: StarRatingProps) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      // Full star
      stars.push(<FontAwesome key={i} name="star" size={size} color={color} />);
    } else if (rating + 0.5 >= i) {
      // Half star
      stars.push(<FontAwesome key={i} name="star-half-full" size={size} color={color} />);
    } else {
      // Empty star
      stars.push(<FontAwesome key={i} name="star-o" size={size} color={color} />);
    }
  }

  return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
});

export default StarRating;
