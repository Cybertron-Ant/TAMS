// src/app/hooks.ts
import {
  TypedUseSelectorHook,
  useDispatch as reduxUseDispatch,
  useSelector as reduxUseSelector,
} from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useDispatch = () => reduxUseDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = reduxUseSelector;
