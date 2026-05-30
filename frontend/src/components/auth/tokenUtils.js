const TOKEN_KEY = 'accessToken';
const USER_KEY = 'authUser';

const decodeJwtPayload = (token) => {
    if (!token || typeof token !== 'string') {
        return null;
    }

    try {
        const payload = token.split('.')[1];
        if (!payload) {
            return null;
        }

        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        return JSON.parse(atob(padded));
    } catch (error) {
        console.error('Error decoding token payload', error);
        return null;
    }
};

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

export const getTokenPayload = (token = getToken()) => decodeJwtPayload(token);

export const getTokenExpiryMs = (token = getToken()) => {
    const payload = getTokenPayload(token);
    if (!payload?.exp) {
        return null;
    }

    return payload.exp * 1000;
};

export const getTokenRemainingMs = (token = getToken()) => {
    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) {
        return null;
    }

    return expiryMs - Date.now();
};
