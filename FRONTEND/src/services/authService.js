import ENVIRONMENT from '../config/environment.js'
export async function login(email, password) {
    const response_http = await fetch(
        ENVIRONMENT.URL_API + '/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    const response = await response_http.json();
    if (!response.ok) {
        throw new Error(response.message);
    }
    return response;
}

export async function register(email, password, username) {
    const response_http = await fetch(
        ENVIRONMENT.URL_API + '/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password,
            name: username
        })
    });

    const response = await response_http.json();
    if (!response.ok) {
        throw new Error(response.message);
    }
    return response;
}

export async function forgotPassword(email) {
    const response_http = await fetch(
        ENVIRONMENT.URL_API + '/api/auth/reset-password-request', {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({ email })
    });

    const response = await response_http.json();
    if (!response.ok) {
        throw new Error(response.message);
    }
    return response;
}

export async function resetPassword(token, newPassword) {
    const response_http = await fetch(
        ENVIRONMENT.URL_API + '/api/auth/reset-password', {
        method: 'PUT',
        headers: {
            'Content-Type': "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
    });

    const response = await response_http.json();
    if (!response.ok) {
        throw new Error(response.message);
    }
    return response;
}