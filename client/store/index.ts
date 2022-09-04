import {Context, createWrapper, MakeStore} from "next-redux-wrapper";
import {AnyAction, applyMiddleware, createStore, Store} from "redux";
import {reducer, RootState} from "./reducers";
import thunk, {ThunkAction, ThunkDispatch} from "redux-thunk";

export const makeStore = createStore(reducer, applyMiddleware(thunk));

const initStore = () => makeStore

export const wrapper = createWrapper<Store<RootState>>(initStore, {debug: false});

export type NextThunkDispatch = ThunkDispatch<RootState, void, AnyAction>