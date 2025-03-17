import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import PropTypes from 'prop-types';

const DEFAULT_STATE = {
  isShownPatientInfo: true,
  isShouldAnonymizePatientInfo: false,
};

export const VisibilityPreferencesContext = createContext([DEFAULT_STATE, {}]);

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_PREFERENCES':
      return { ...state, ...action.payload };
    default:
      return action.payload;
  }
};

export default function VisibilityPreferencesProvider({ children, service }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  const getState = useCallback(() => state, [state]);

  const setVisibilityPreferences = useCallback(
    prefs => dispatch({ type: 'SET_VISIBILITY_PREFERENCES', payload: prefs }),
    [dispatch]
  );

  useEffect(
    () => service.setServiceImplementation({ getState, setVisibilityPreferences }),
    [service, getState, setVisibilityPreferences]
  );

  return (
    <VisibilityPreferencesContext.Provider
      value={useMemo(
        () => [state, { getState, setVisibilityPreferences }],
        [state, getState, setVisibilityPreferences]
      )}
    >
      {children}
    </VisibilityPreferencesContext.Provider>
  );
}

VisibilityPreferencesProvider.propTypes = {
  children: PropTypes.any,
  service: PropTypes.shape({ setServiceImplementation: PropTypes.func }).isRequired,
};

export const useVisibilityPreferences = () => useContext(VisibilityPreferencesContext);
