import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaView, ActivityIndicator, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileScreen from "../screens/ProfileScreen";
import HomeScreen from "../screens/HomeScreen";
import BooksScreen from "../screens/BooksScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import BookDetailsScreen from "../screens/BookDetailsScreen";

type RootTabParamList = {
  HomeStack: undefined;
  Books: undefined;
  Profile: undefined;
};

type HomeStackParamList = {
  Home: undefined;
  BookDetails: { bookId: number };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="BookDetails" component={BookDetailsScreen} />
  </HomeStack.Navigator>
);

const AuthenticatedTabs: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName: string = "help";
        if (route.name === "HomeStack") iconName = "home";
        if (route.name === "Profile") iconName = "person";
        if (route.name === "Books") iconName = "book";
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "tomato",
      tabBarInactiveTintColor: "gray",
      headerShown: false,
    })}
  >
    <Tab.Screen
      name="HomeStack"
      component={HomeStackNavigator}
      options={{ tabBarLabel: "Accueil" }}
    />
    <Tab.Screen
      name="Books"
      component={BooksScreen}
      options={{ tabBarLabel: "Mes livres" }}
    />
    <Tab.Screen name="Profile" options={{ tabBarLabel: "Profil" }}>
      {() => <ProfileScreen onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);

interface AuthScreensProps {
  onLogin: () => void;
  onRegister: () => void;
}

const AuthScreens: React.FC<AuthScreensProps> = ({ onLogin, onRegister }) => {
  const [showRegister, setShowRegister] = useState<boolean>(false);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!showRegister ? (
        <LoginScreen onLogin={onLogin} onSwitch={() => setShowRegister(true)} />
      ) : (
        <RegisterScreen onSwitch={() => setShowRegister(false)} />
      )}
    </SafeAreaView>
  );
};

const TabNavigation: React.FC = () => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("user");
      console.log("Déconnecté avec succès");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          console.log("Token found, user is already authenticated");
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const handleLogin = () => {
    console.log("Login successful, navigating to home");
    setIsAuthenticated(true);
  };

  const handleRegister = () => {
    console.log("Registration successful, navigating to home");
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AuthenticatedTabs onLogout={handleLogout} />
      ) : (
        <AuthScreens onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </NavigationContainer>
  );
};

export default TabNavigation;