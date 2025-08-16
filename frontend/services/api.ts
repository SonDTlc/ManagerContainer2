import axios from 'axios';

export const api = axios.create({ baseURL: '/backend' });

export async function feLog(message: string, meta?: any){
	try{
		await fetch('/api/fe-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, meta, at: new Date().toISOString() }) });
	}catch{}
}

// Allow overriding baseURL via environment for production deployments
{
	const envBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '');
	if (envBase) {
		api.defaults.baseURL = envBase;
	}
}

api.interceptors.request.use((config)=>{
	if (typeof window !== 'undefined'){
		const token = localStorage.getItem('token');
		if (token){
			const headers = (config.headers || {}) as any;
			headers['Authorization'] = `Bearer ${token}`;
			config.headers = headers;
		}
	}
	return config;
});

let isRefreshing = false;
let pending: Array<(t: string)=>void> = [];

api.interceptors.response.use(r => r, async (error) => {
	const status = error?.response?.status;
	if (status === 401 && !isRefreshing) {
		try{
			isRefreshing = true;
			const refresh_token = localStorage.getItem('refresh_token');
			const user_id = localStorage.getItem('user_id');
			if (refresh_token && user_id) {
				const base = (api.defaults.baseURL?.toString() || '').replace(/\/+$/, '');
				const resp = await axios.post(`${base}/auth/refresh`, { user_id, refresh_token });
				localStorage.setItem('token', resp.data.access_token);
				localStorage.setItem('refresh_token', resp.data.refresh_token);
				pending.forEach(fn => fn(resp.data.access_token));
				pending = [];
				isRefreshing = false;
				const cfg = error.config;
				const hdrs = (cfg.headers || {}) as any;
				hdrs['Authorization'] = `Bearer ${resp.data.access_token}`;
				cfg.headers = hdrs;
				return axios(cfg);
			}
		}catch(e){
			isRefreshing = false;
		}
	}
	if (status === 401 && isRefreshing) {
		return new Promise((resolve) => {
			pending.push((t: string)=>{
				const cfg = error.config;
				const hdrs = (cfg.headers || {}) as any;
				hdrs['Authorization'] = `Bearer ${t}`;
				cfg.headers = hdrs;
				resolve(axios(cfg));
			});
		});
	}
	try{ await feLog('API_ERROR', { url: error?.config?.url, status: error?.response?.status, data: error?.response?.data }); }catch{}
	return Promise.reject(error);
});
