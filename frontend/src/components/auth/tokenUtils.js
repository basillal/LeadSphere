const TOKEN_KEY = 'accessToken';
const USER_KEY = 'authUser';

export const setToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const setUser = (user) => {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(USER_KEY);
    }
};

export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    try {
        return user ? JSON.parse(user) : null;
    } catch (e) {
        console.error('Error parsing user session', e);
        return null;
    }
};

export const removeUser = () => {
    localStorage.removeItem(USER_KEY);
};
