import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.loading = false;
    },

    authFailed: (state) => {
      state.user = null;
      state.accessToken = null;
      state.loading = false;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const {
  login,
  authFailed,
  logout,
} = authSlice.actions;

export default authSlice.reducer;