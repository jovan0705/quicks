import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
export interface IAuthState {
  chats: any;
}

const initialState: IAuthState = {
  chats: [],
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChatsState: (state, chats) => {
      // ini get nya hit ke api
      state.chats = chats.payload;
    },
  },
});

export const { setChatsState } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;