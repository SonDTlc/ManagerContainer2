import { useState } from 'react';
import Header from '@components/Header';
import { api } from '@services/api';
import Link from 'next/link';
import { homeFor } from '@utils/rbac';

export default function Login(){
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const onLogin = async () => {
		setError('');
		try{
			const res = await api.post('/auth/login', { username, password });
			if (typeof window !== 'undefined'){
				localStorage.setItem('token', res.data.access_token);
				localStorage.setItem('refresh_token', res.data.refresh_token);
				localStorage.setItem('user_id', res.data.user._id || res.data.user.id);
				const dest = homeFor(res.data.user.role || res.data.user.roles?.[0]);
				window.location.href = dest;
			}
		}catch(e: any){
			const code = e?.response?.status;
			if (code === 423) setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
			else setError('Tên đăng nhập hoặc mật khẩu không chính xác');
		}
	};

	return (
		<>
			<Header />
			<main className="container">
				<div className="card" style={{maxWidth:420, margin:'40px auto'}}>
					<h3 style={{marginTop:0}}>Đăng nhập</h3>
					<div style={{display:'grid', gap:12}}>
						<input type="text" placeholder="Tên đăng nhập" value={username} onChange={e=>setUsername(e.target.value)} />
						<input type="password" placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)} />
						{error && <div style={{color:'#dc2626', fontSize:13}}>{error}</div>}
						<button className="btn" onClick={onLogin}>Đăng nhập</button>
						<div style={{fontSize:13,color:'#6b7280',textAlign:'center'}}>
							Chưa có mật khẩu? <Link href="/Register">Kích hoạt tài khoản (Accept Invite)</Link>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
