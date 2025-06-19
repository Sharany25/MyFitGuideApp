import React, { createContext, useReducer, useEffect, useContext, ReactNode, Dispatch } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  userId: string;
  nombre: string;
  correoElectronico: string;
  fechaNacimiento?: string;
  ubicacion?: string | null;
  edad?: string;
  objetivo?: string;
  alergias?: string[];
  presupuesto?: string;
  genero?: 'masculino' | 'femenino' | '';
  altura?: string;
  peso?: string;
  preferencias?: string[];
  dias?: string;
  lesiones?: string;
};

type State = {
  user: UserProfile | null;
  loading: boolean;
};

type Action =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'CLEAR_USER' }
  | { type: 'LOADING' };

const initialState: State = {
  user: null,
  loading: true,
};

const UserContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

function userReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'CLEAR_USER':
      return { ...state, user: null, loading: false };
    default:
      return state;
  }
}

const STORAGE_KEY = 'userProfile';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  useEffect(() => {
    (async () => {
      dispatch({ type: 'LOADING' });
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          const user: UserProfile = JSON.parse(data);
          dispatch({ type: 'SET_USER', payload: user });
        } else {
          dispatch({ type: 'CLEAR_USER' });
        }
      } catch (err) {
        dispatch({ type: 'CLEAR_USER' });
      }
    })();
  }, []);

  useEffect(() => {
    if (state.user) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
    } else {
      AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, [state.user]);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
