import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "../App";

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
