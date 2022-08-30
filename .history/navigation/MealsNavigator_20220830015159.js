import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation"

import MenuScreen from "../screens/MenuScreen";
import StartGameScreen from "../screens/StartGameScreen";
import GameScreen from "../screens/GameScreen";
import GameOverScreen from "../screens/GameOverScreen";


const MealsNavigator = createStackNavigator({
    Menu: MenuScreen,
    StartGame: StartGameScreen,
    GameScreen: GameScreen,
    GameOver: GameOverScreen,
});

export default createAppContainer(MealsNavigator);

