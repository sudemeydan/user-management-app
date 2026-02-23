import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001'
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        const res = await axios.post('http://localhost:3001/users/refresh', { refreshToken });

        if (res.data.success) {
          localStorage.setItem('accessToken', res.data.accessToken);
          
          originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
          
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.reload(); 
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;