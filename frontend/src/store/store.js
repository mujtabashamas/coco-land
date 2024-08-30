import { configureStore } from "@reduxjs/toolkit";
import { useSelector, useDispatch } from "react-redux";
import userReducer from "../features/userSlice";

const reducer = {
  user: userReducer,
}

export const store = configureStore({
  reducer: reducer,
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;