import { createSlice } from "@reduxjs/toolkit";
import { getSocket } from "../socket/socket";

const initialState = {
    users: [],
    user: null,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            const socket = getSocket();
            const userData = { ...action.payload, id: socket.id }
            state.user = userData;
            socket.emit('login', userData);
        },
        // logout: (state, action) => {
        //     socket.emit('disconnect', state.user.id);
        //     state.user = null;
        // },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        getAllUsers: (state, action) => {
            state.users = action.payload;
        },
        getUser: (state, action) => {
            state.user = action.payload;
        }
    }
})

export const { login, getAllUsers, updateUser, getUser } = userSlice.actions;
export default userSlice.reducer;
