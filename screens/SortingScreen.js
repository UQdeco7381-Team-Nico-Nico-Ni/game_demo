import { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  ImageBackground,
  Alert,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { DraxProvider, DraxView } from "react-native-drax";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors } from "../constants/styles";
import DragBox from "../components/ui/DragBox";
import Timer from "../components/ui/Timer";
import ScoreBox from "../components/ui/ScoreBox";
import dataFile from "../data/garbagesList";
import { Category } from "../constants/GarbageInfo";
import { storeRecord } from "../util/htttp";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../store/auth-context";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import ErrorOverlay from "../components/ui/ErrorOverlay";
import AppLoading from "expo-app-loading";

// Buttons
import CustomButton from "../components/ui/CustomButton";
import EntypoIconButton from "../components/ui/EntypoIconButton";
import MaterialIconsButton from "../components/ui/MaterialIconsButton";

// Method of generate random numbers.
const generateRandomBetween = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  const rndNum = Math.floor(Math.random() * (max - min)) + min;
  return rndNum;
};

const SortingScreen = (props) => {
  const navigation = useNavigation();

  const [received, setReceived] = useState([]);
  const [staged, setStaged] = useState([]);
  const [garbages, setGarbages] = useState(dataFile);
  const [selectedCards, setSelectedCards] = useState([]);
  const [point, setPoint] = useState(0);
  const [userName, setUserName] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  const [isTryingLogin, setIsTryingLogin] = useState(true);

  const authCtx = useContext(AuthContext);

  // test function to clear the all cards.
  const clear = () => {
    setSelectedCards([]);
  }

  // Track the game state, set the condition of generate the game cards
  useEffect(() => {
    if (selectedCards.length < 4) {
      if (garbages.length != 0) {
        const pickedNum = parseInt(generateRandomBetween(0, garbages.length));
        const pickItem = garbages[pickedNum];
        setSelectedCards((selectedCards) => [...selectedCards, pickItem]);
        setGarbages(garbages.filter((item) => item !== pickItem));
      }
    }
  }, [selectedCards.length]);

  // Get the current user
  useEffect(() => {
    async function fetchUser() {
      const storedToken = await AsyncStorage.getItem("token");
      const userName = await AsyncStorage.getItem("userName");

      if (storedToken) {
        authCtx.authenticate(storedToken);
        setUserName(userName);
      }

        setIsTryingLogin(false);
    }

    fetchUser();
  }, []);

  if (isTryingLogin) {
    return <AppLoading />;
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    const record = {
      player: userName,
      point: point,
    };
    try {
      await storeRecord(record);
      setIsSubmitting(false);
      Alert.alert('Saved!');
    } catch (error) {
      setError('Fail to record!')
      setIsSubmitting(false);
      Alert.alert('Fail to record!');
    }
    navigation.goBack();
  }

  // Generate the game cards UI components
  const renderGridItem = (selectedCards) => {
    return selectedCards.map((garbage) => {
      return (
        <DragBox
          key={garbage.id}
          id={garbage.id}
          title={garbage.title}
          imageUrl={garbage.imageUrl}
          category={garbage.category}
          onDragDrop={() => deleteItem(garbage)}
        />
      );
    });
  };

  if (isSubmitting) {
    return <LoadingOverlay />;
  }

  // Delete card items
  const deleteItem = (garbage) => {
    setSelectedCards(selectedCards.filter((item) => item.id !== garbage.id));
  };

  // Ending contents
  if (
    garbages &&
    garbages.length == 0 &&
    selectedCards &&
    selectedCards.length == 0
  ) {
    return (
      <View style={styles.gameOver}>
        <Text>Congratulation! You Got {point} Point!</Text>
        <Button
          title="Back to Menu"
          onPress={() => {
            navigation.navigate("MainMenu");
          }}
        />
        <Button title="Save Record" onPress={() => handleSubmit()} />
      </View>
    );
  }

  // Handle the ok button
  function errorHandler() {
    setError(null);
    navigation.goBack();
  }

  return (
    <DraxProvider>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <EntypoIconButton
          style={styles.buttonContainer}
          icon="arrow-with-circle-left"
          size={36}
          color={Colors.rose}
          onPress={() => {
            navigation.navigate("MainMenu");
          }}
        />
        <MaterialIconsButton
          style={styles.buttonContainer}
          icon="alert-box"
          size={36}
          color={Colors.rose}
          onPress={() => {
            clear()
          }}
        />
        <Timer style={styles.buttonContainer} />
        <ScoreBox points={point} style={styles.buttonContainer} />
      </View>

      {/* Cards Section */}
      <GestureHandlerRootView>
        <View style={styles.palette}>
          <View style={styles.garbagesList}>
            {renderGridItem(selectedCards)}
          </View>
        </View>
      </GestureHandlerRootView>

      {/* Bins Section */}
      <View style={styles.container}>
        <DraxView
          // General Bin
          style={[styles.centeredContent, styles.receivingZone]}
          receivingStyle={styles.receiving}
          renderContent={({ viewState }) => {
            const receivingDrag = viewState && viewState.receivingDrag;
            const payload = receivingDrag && receivingDrag.payload;
            const bin_image = require("../assets/images/bins/General_Bin.png");
            const combinedStyles = [
              styles.centeredContent,
              styles.receivingZone,
            ];
            return (
              <>
                <View style={styles.binsContainer}>
                  <ImageBackground
                    source={bin_image}
                    resizeMode="stretch"
                    style={styles.binImage}
                  ></ImageBackground>
                </View>
              </>
            );
          }}
          // Handle the result of drag.
          onReceiveDragDrop={(event) => {
            if (event.dragged.payload == Category.general) {
              setPoint(point + 200);
            } else {
              console.log("incorrect!");
            }
          }}
        />

        <DraxView
          // Recycle Bin
          style={[styles.centeredContent, styles.receivingZone]}
          receivingStyle={styles.receiving}
          dragPayload={staged.join(" ")}
          draggable={staged.length > 0}
          renderContent={({ viewState }) => {
            const receivingDrag = viewState && viewState.receivingDrag;
            const payload = receivingDrag && receivingDrag.payload;
            const dragging = viewState && viewState.dragStatus !== 0;
            const bin_image = require("../assets/images/bins/Recycling_Bin.png");
            const combinedStyles = [
              styles.centeredContent,
              styles.receivingZone,
            ];
            if (dragging) {
              combinedStyles.push({ opacity: 0.2 });
            } else if (receivingDrag) {
              combinedStyles.push(styles.receiving);
            }
            return (
              <View style={styles.binsContainer}>
                <ImageBackground
                  source={bin_image}
                  resizeMode="stretch"
                  style={styles.binImage}
                ></ImageBackground>
              </View>
            );
          }}
          // Handle the result of drag.
          onReceiveDragDrop={(event) => {
            if (event.dragged.payload == Category.recycle) {
              setPoint(point + 200);
            } else {
              console.log("incorrect!");
            }
          }}
        />

        <DraxView
          // Green Bin
          style={[styles.centeredContent, styles.receivingZone]}
          receivingStyle={styles.receiving}
          dragPayload={staged.join(" ")}
          draggable={staged.length > 0}
          renderContent={({ viewState }) => {
            const receivingDrag = viewState && viewState.receivingDrag;
            const payload = receivingDrag && receivingDrag.payload;
            const dragging = viewState && viewState.dragStatus !== 0;
            const bin_image = require("../assets/images/bins/Green_Bin.png");
            const combinedStyles = [
              styles.centeredContent,
              styles.receivingZone,
            ];

            // Handle the dragging and receiving animation
            if (dragging) {
              combinedStyles.push({ opacity: 0.2 });
            } else if (receivingDrag) {
              combinedStyles.push(styles.receiving);
            }
            return (
              <View style={styles.binsContainer}>
                <ImageBackground
                  source={bin_image}
                  resizeMode='stretch'
                  style={styles.binImage}
                ></ImageBackground>
              </View>
            );
          }}
          // Handle the result of drag.
          onReceiveDragDrop={(event) => {
            if (event.dragged.payload == Category.green) {
              setPoint(point + 200);
            } else {
              console.log("incorrect!");
            }
          }}
        />
      </View>
    </DraxProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    paddingTop: 30,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  binsContainer: {
    flex: 1,
    padding: 12,
    paddingTop: 10,
    flexDirection: "row",
  },
  centeredContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  receivingZone: {
    width: 120,
    height: 180,
    borderRadius: 10,
  },
  receiving: {
    // the receiving animation effects
    borderColor: "red",
    borderWidth: 2,
  },
  palette: {
    paddingTop: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    height: "50%",
  },
  draggableBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
  },
  binImage: {
    height: 170,
    flex: 1,
  },
  dragging: {
    opacity: 0.2,
  },
  gameOver: {
    flex: 1,
    padding: 12,
    paddingTop: 40,
  },
  garbagesList: {
    margin: 10,
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignContent: "space-around",
    flexDirection: "row",
  },
  buttonContainer: {
    flex: 1,
  },
  headerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SortingScreen;
