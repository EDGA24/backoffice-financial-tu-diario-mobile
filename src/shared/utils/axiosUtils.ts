import axios from 'axios';

const instance = axios.create({
    headers: {
        "Content-type": "application/json"
    }
})

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;