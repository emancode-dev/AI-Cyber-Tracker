import {
  createContext,
  useContext,
  useState
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authStatus, setAuthStatus] = useState(
    "unauthenticated"
  );

  const [user, setUser] = useState(null);

  function login() {
    // Temporary simulation.
    // Later this will happen after the backend
    // successfully verifies the login.

    setUser({
      id: 1,
      name: "Test User",
      email: "test@example.com"
    });

    setAuthStatus("authenticated");
  }

  function logout() {
    setUser(null);
    setAuthStatus("unauthenticated");
  }

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        setAuthStatus,
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}