import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation"

import MenuScreen from "../screens/MenuScreen";
import StartGameScreen from "../screens/StartGameScreen";
import GameScreen from "../screens/GameScreen";
import GameOverScreen from "../screens/GameOverScreen";
import SortingScreen from "../screens/SortingScreen";
import TestScreen from "../screens/TestScreen";


const GameNavigator = createStackNavigator({
    Main_Menu: MenuScreen,
    StartGame: StartGameScreen,
    GameScreen: GameScreen,
    GameOver: GameOverScreen,
    Sorting: SortingScreen,
    Testing: TestScreen,
});

export default createAppContainer(GameNavigator);

