import axios from 'axios';
import { getCookie } from 'cookies-next';

const host = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})
    
const authHost = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const authInterceptor = (config : any) => {
    config.headers.authorization = `Bearer ${getCookie('token')}`
    return config
}
authHost.interceptors.request.use(authInterceptor)

export {
    host,
    authHost
}