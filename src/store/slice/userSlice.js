import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = {
        ...user,
        _id: user.id || user._id,
        id: user.id || user._id
      };
      state.token = token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
        _id: action.payload.id || action.payload._id || state.user._id,
        id: action.payload.id || action.payload._id || state.user.id
      };
    }
  }
});

export const { setCredentials, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;