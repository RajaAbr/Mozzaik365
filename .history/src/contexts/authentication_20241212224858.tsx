import { jwtDecode } from "jwt-decode";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AuthenticationState =
  | {
      isAuthenticated: boolean;
      token: string;
      userId: string;
    }
  | {
      isAuthenticated: boolean;
    };

export type Authentication = {
  state: AuthenticationState;
  authenticate: (token: string) => void;
  signout: () => void;
};

export const AuthenticationContext = createContext<Authentication | undefined>(
  undefined
);

export const AuthenticationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState<AuthenticationState>({
    isAuthenticated: localStorage.getItem("authToken") ? true : false,
    token: localStorage.getItem("authToken"),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if ("token" in state && isTokenExpired(state.token)) {
        signout();
      }
    }, 200000); // Check every 10min

    return () => clearInterval(interval);
  }, [state]);

  const isTokenExpired = (token: string) => {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      return decoded.exp * 1000 < Date.now(); // Compare expiration with current time
    } catch {
      return true; // Assume invalid token
    }
  };

  const authenticate = useCallback(
    (token: string) => {
      localStorage.setItem("authToken", token);
      setState({
        isAuthenticated: true,
        token,
        userId: jwtDecode<{ id: string }>(token).id,
      });
    },
    [setState]
  );

  const signout = useCallback(() => {
    localStorage.removeItem("authToken");
    setState({ isAuthenticated: false });
  }, [setState]);

  const contextValue = useMemo(
    () => ({ state, authenticate, signout }),
    [state, authenticate, signout]
  );

  return (
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export function useAuthentication() {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error(
      "useAuthentication must be used within an AuthenticationProvider"
    );
  }
  return context;
}

export function useAuthToken() {
  const { state } = useAuthentication();
  if (!state.isAuthenticated) {
    throw new Error("User is not authenticated");
  }
  return state.token;
}
