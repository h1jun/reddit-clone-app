import { createContext, useContext, useReducer } from "react";
import { User } from "../types";

interface AuthState {
  authenticate: boolean;
  user: User | undefined;
  loading: boolean;
}

const StateContext = createContext<AuthState>({
  authenticate: false,
  user: undefined,
  loading: true,
});

const DispathContext = createContext<any>(null);

interface Action {
  type: string;
  payload: any;
}

const reducer = (state: AuthState, { type, payload }: Action) => {
  switch (type) {
    case "LOGIN":
      return {
        ...state,
        authenticate: true,
        user: payload,
      };
    case "LOGOUT":
      return {
        ...state,
        authenticate: false,
        user: null,
      };
    case "STOP_LOADING":
      return {
        ...state,
        loading: false,
      };
    default:
      throw new Error(`Unkown action type: ${type}`);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, defaultDispath] = useReducer(reducer, {
    user: null,
    authenticate: false,
    loading: true,
  });

  const dispath = (type: string, payload?: any) => {
    defaultDispath({ type, payload });
  };

  console.log(state);

  return (
    <DispathContext.Provider value={dispath}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispathContext.Provider>
  );
};

export const useAuthState = () => useContext(StateContext);
export const useAuthDispath = () => useContext(DispathContext);
