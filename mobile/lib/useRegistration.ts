import { useEffect, useState } from "react";
import { getLocalRegistration, Registration } from "./registration";

interface RegistrationState {
  loading: boolean;
  registration: Registration | null;
}

/** Whether this device has registered (Name/City/Gender/Occupation, no
 *  password, no phone) — see lib/registration.ts. Re-check with `refresh()`
 *  after registering or clearing the local record, since there's no auth
 *  session to subscribe to changes on. */
export function useRegistration(): RegistrationState & { refresh: () => void } {
  const [state, setState] = useState<RegistrationState>({ loading: true, registration: null });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let mounted = true;
    getLocalRegistration().then((registration) => {
      if (mounted) setState({ loading: false, registration });
    });
    return () => {
      mounted = false;
    };
  }, [reloadToken]);

  return { ...state, refresh: () => setReloadToken((t) => t + 1) };
}
