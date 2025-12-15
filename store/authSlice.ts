import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserData = {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
};

interface AuthState {
  user: UserData | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserData>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
