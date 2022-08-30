import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

const MenuScreen = (props) => {
  return (
    <View style={styles.screen}>
        <Text>The Categories Screen!</Text>
      <Button
        title="New Game"
        onPress={() => {
          props.navigation.navigate({ routeName: "Testting" });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MenuScreen;
