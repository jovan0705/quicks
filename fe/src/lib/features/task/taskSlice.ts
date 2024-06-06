import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
export interface IAuthState {
  tasks: object[];
}

const initialState: IAuthState = {
  tasks: [],
};

export const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasksState: (state, action: PayloadAction<object[]>) => {
      state.tasks = action.payload;
    },
  },
});

export const { setTasksState } = taskSlice.actions;
export const taskReducer = taskSlice.reducer;