import Colors from "@/styles/colors";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  onPress?: () => void;
  color?: string;
  backgroundColor?: string;
  title: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginRight?: number;
  marginLeft?: number;
  fontFamily?: string;
  fontSize?: number;
}

const Button = ({
  onPress,
  color = Colors.primaryLight,
  backgroundColor = Colors.primary,
  title,
  paddingTop = 16,
  paddingBottom = 16,
  paddingLeft = 8,
  paddingRight = 8,
  marginRight,
  marginLeft,
  fontFamily,
  fontSize = 14,
}: Props) => {
  return (
    <View>
      <Pressable
        style={[
          {
            backgroundColor: backgroundColor,
            paddingTop: paddingTop,
            paddingBottom: paddingBottom,
            marginRight: marginRight,
            marginLeft: marginLeft,
          },
          styles.button,
        ]}
        onPress={onPress}
      >
        <Text
          style={{
            color: color,
            paddingLeft: paddingLeft,
            paddingRight: paddingRight,
            marginLeft: marginLeft,
            fontFamily: fontFamily,
            fontSize: fontSize,
          }}
        >
          {title}
        </Text>
      </Pressable>
    </View>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 100,
  },
});
