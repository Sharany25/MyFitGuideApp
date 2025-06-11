import React, { createContext, useContext, useReducer } from 'react';

// Definición de tipos
export type User = {
  userId: string;
  nombre: string;
  // Agrega aquí más campos según sea necesario
};

type State = {
  isAuthenticated: boolean;
  user: User | null;
};

type Action =
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGOUT' };

// Estado inicial
const initialState: State = {
  isAuthenticated: false,
  user: null,
};

// Reducer
const authReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

// Contexto de autenticación
const AuthContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Proveedor de contexto
export const AuthProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);
