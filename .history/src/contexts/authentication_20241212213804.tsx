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
import { BASE_URL } from "../api";

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
    isAuthenticated: false,
  });

  // Verify token
  useEffect(() => {
    /*const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setState({
        isAuthenticated: true,
        token: storedToken,
        userId: jwtDecode<{ id: string }>(storedToken).id,
      });
    }*/

    const loadUser = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await fetch(`${BASE_URL}/authentication/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => console.log("ressss", res));
        } catch (error) {
          console.error("Failed to fetch user", error);
          signout();
        }
      }
    };

    loadUser();
  }, []);

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
