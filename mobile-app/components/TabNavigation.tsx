import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaView, ActivityIndicator, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Screens
import ProfileScreen from "../screens/ProfileScreen";
import HomeScreen from "../screens/HomeScreen";
import BooksScreen from "../screens/BooksScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import BookDetailsScreen from "../screens/BookDetailsScreen";
import NewBookScreen from "../screens/NewBookScreen";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import EditBookScreen from "../screens/EditBookScreen";
import LoansBooksList from "../screens/LoansBooksList";

// Types
type RootTabParamList = {
  HomeStack: undefined;
  Books: undefined;
  CreateBook: undefined;
  Profile: undefined;
};

type HomeStackParamList = {
  Home: undefined;
  BookDetails: { bookId: number };
  EditBook: { bookId: number };
  LoansBooks: undefined;
};

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "user" | "admin";
};

// Navigators
const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC<{ userRole: User["role"] }> = ({
  userRole,
}) => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen
      name="Home"
      component={userRole === "admin" ? AdminHomeScreen : HomeScreen}
    />
    <HomeStack.Screen name="BookDetails" component={BookDetailsScreen} />
    <HomeStack.Screen name="EditBook" component={EditBookScreen} />
    <HomeStack.Screen name="LoansBooks" component={LoansBooksList} />
  </HomeStack.Navigator>
);

interface AuthenticatedTabsProps {
  onLogout: () => void;
  userRole: User["role"];
}

const AuthenticatedTabs: React.FC<AuthenticatedTabsProps> = ({
  onLogout,
  userRole,
}) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons = {
          HomeStack: "home",
          Books: "book",
          CreateBook: "add-circle",
          Profile: "person",
        };

        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#4299E1",
      tabBarInactiveTintColor: "#718096",
      headerShown: false,
      tabBarStyle: {
        paddingVertical: 5,
        height: 60,
      },
    })}
  >
    <Tab.Screen name="HomeStack" options={{ tabBarLabel: "Accueil" }}>
      {() => <HomeStackNavigator userRole={userRole} />}
    </Tab.Screen>

    {userRole === "admin" ? (
      <Tab.Screen
        name="CreateBook"
        component={NewBookScreen}
        options={{
          tabBarLabel: "Nouveau livre",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
    ) : (
      <Tab.Screen
        name="Books"
        component={BooksScreen}
        options={{
          tabBarLabel: "Mes livres",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
    )}

    <Tab.Screen
      name="Profile"
      options={{
        tabBarLabel: "Profil",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person" size={size} color={color} />
        ),
      }}
    >
      {() => <ProfileScreen onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);

interface AuthScreensProps {
  onLogin: () => void;
  onRegister: () => void;
}

const AuthScreens: React.FC<AuthScreensProps> = ({ onLogin, onRegister }) => {
  const [showRegister, setShowRegister] = useState(false);

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<User["role"]>("user");
  const [loading, setLoading] = useState(true);

  const checkAuthentication = async () => {
    try {
      const [token, userString] = await Promise.all([
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("user"),
      ]);

      if (token && userString) {
        const user: User = JSON.parse(userString);
        setUserRole(user.role);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Erreur vérification auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["authToken", "user"]);
      setIsAuthenticated(false);
      setUserRole("user");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4299E1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AuthenticatedTabs onLogout={handleLogout} userRole={userRole} />
      ) : (
        <AuthScreens
          onLogin={checkAuthentication}
          onRegister={checkAuthentication}
        />
      )}
    </NavigationContainer>
  );
};

export default TabNavigation;
