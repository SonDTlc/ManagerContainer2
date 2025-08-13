import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { canViewUsersPartners } from '@utils/rbac';
import { api } from '@services/api';

export default function Header(){
	const router = useRouter();
	const [hasToken, setHasToken] = useState(false);
	const [me, setMe] = useState<{ email?: string; role?: string }|null>(null);
	useEffect(()=>{
		if (typeof window !== 'undefined'){
			const tok = !!localStorage.getItem('token');
			setHasToken(tok);
			if (tok) api.get('/auth/me').then(r=>setMe({ email: r.data?.email, role: r.data?.role || r.data?.roles?.[0] })).catch(()=>{});
		}
	}, []);

	const onLogout = () => {
		try{
			if (typeof window !== 'undefined'){
				localStorage.removeItem('token');
				localStorage.removeItem('refresh_token');
				window.location.href = '/Login';
			}
		}catch{}
	};
	const showLogout = hasToken && router.pathname !== '/Login';
	const showUsersLink = canViewUsersPartners(me?.role);
	return (
		<header className="header">
			<div className="container header-inner" style={{justifyContent:'space-between'}}>
				<div style={{display:'flex',alignItems:'center',gap:12}}>
					<Link href="/">
						<Image src="/sml_logo.png" alt="Smartlog" width={120} height={32} className="logo"/>
					</Link>
					<div className="title">Smartlog Container Manager</div>
				</div>
				<div style={{display:'flex',alignItems:'center',gap:12}}>
					{showUsersLink && <Link className="btn" href="/UsersPartners" style={{background:'#fff',color:'#0a2558'}}>Users/Partners</Link>}
					{hasToken && <Link className="btn" href="/Account" style={{background:'#fff',color:'#0a2558'}}>Tài khoản</Link>}
					{me?.role && <span style={{color:'#fff',opacity:.9,fontSize:12}}>({me.role}) {me.email}</span>}
					{showLogout && <button className="btn" onClick={onLogout} style={{background:'#fff',color:'#0a2558'}}>Đăng xuất</button>}
					{!hasToken && router.pathname !== '/Login' && <Link className="btn" href="/Login" style={{background:'#fff',color:'#0a2558'}}>Đăng nhập</Link>}
				</div>
			</div>
		</header>
	);
}
