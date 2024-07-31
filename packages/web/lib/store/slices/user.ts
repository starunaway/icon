import { SsoUser } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {} as Partial<SsoUser>,
  reducers: {
    initialUser(state, action: PayloadAction<Partial<SsoUser>>) {
      return action.payload;
    },
  },
});

export const { initialUser } = userSlice.actions;

export default userSlice.reducer;
