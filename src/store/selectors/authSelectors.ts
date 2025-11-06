import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Base selector
const selectAuth = (state: RootState) => state.auth;

// Memoized selectors
export const selectUser = createSelector(
  [selectAuth],
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  [selectAuth],
  (auth) => auth.isAuthenticated
);

export const selectIsLoading = createSelector(
  [selectAuth],
  (auth) => auth.isLoading
);

export const selectAuthError = createSelector(
  [selectAuth],
  (auth) => auth.error
);

export const selectIsInitialized = createSelector(
  [selectAuth],
  (auth) => auth.isInitialized
);

export const selectAuthState = createSelector(
  [selectAuth],
  (auth) => auth
);

// Computed selectors
export const selectUserName = createSelector(
  [selectUser],
  (user) => user?.name || ''
);

export const selectUserEmail = createSelector(
  [selectUser],
  (user) => user?.email || ''
);

export const selectIsAuthReady = createSelector(
  [selectIsInitialized, selectIsLoading],
  (isInitialized, isLoading) => isInitialized && !isLoading
);
