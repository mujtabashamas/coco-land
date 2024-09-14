import { createSlice } from "@reduxjs/toolkit";
import socket from '../socket/socket'

const initialState = {
    users: [],
    user: null,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            const fullUser = { ...action.payload, id: socket.id }
            state.user = fullUser;
            socket.emit('login', state.user);
        },
        logout: (state, action) => {
            state.user = null;
            socket.emit('disconnect')
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        getAllUsers: (state, action) => {
            state.users = action.payload;
        }
    }
})

export const { login, logout, getAllUsers, updateUser } = userSlice.actions;
export default userSlice.reducer;
