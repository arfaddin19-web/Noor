import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList, HomeStackParamList } from "../App";

/** Lets any screen navigate to a root-level route (e.g. MasjidSetup, opened from
 *  the Account tab) without threading getParent() calls through nested navigators. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function rootNavigate<RouteName extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[RouteName]
    ? [screen: RouteName] | [screen: RouteName, params: RootStackParamList[RouteName]]
    : [screen: RouteName, params: RootStackParamList[RouteName]]
) {
  if (navigationRef.isReady()) {
    // @ts-expect-error — react-navigation's generic overloads don't infer well through this spread.
    navigationRef.navigate(...args);
  }
}

/** Jumps to a screen inside the Home tab's stack (e.g. Settings) from anywhere,
 *  including sibling tabs like Account — avoids threading getParent() chains. */
export function goToHomeStackScreen<RouteName extends keyof HomeStackParamList>(
  screen: RouteName,
  params?: HomeStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    // @ts-expect-error — nested tab/stack navigate typing isn't inferred through this helper.
    navigationRef.navigate("Main", { screen: "Home", params: { screen, params } });
  }
}
