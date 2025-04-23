import { StackNavigationProp } from "@react-navigation/stack";

export type HomeStackParamList = {
  Home: undefined;
  BookDetails: { bookId: number };
  EditBook: { bookId: number };
};

export type BookDetailsScreenProps = StackNavigationProp<
  HomeStackParamList,
  "BookDetails"
>;

export type HomeScreenProps = StackNavigationProp<HomeStackParamList, "Home">;
