import Header from '@components/Header';
import Card from '@components/Card';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@services/api';
import { canViewUsersPartners } from '@utils/rbac';

export default function Dashboard(){
	const [me, setMe] = useState<any>(null);
	useEffect(()=>{ api.get('/auth/me').then(r=>setMe(r.data)).catch(()=>{}); }, []);
	const role = me?.role || me?.roles?.[0];
	return (
		<>
			<Header />
			<main className="container">
				<Card title={`Chào ${me?.full_name || ''} (${role || '...'})`}>
					<div className="grid grid-cols-3">
						{canViewUsersPartners(role) && (
							<Card title="Quản lý người dùng & đối tác" actions={<Link className="btn" href="/UsersPartners">Mở</Link>}>
								Tạo/mời user, quản lý khách hàng/đối tác.
							</Card>
						)}
						<Card title="Tài khoản cá nhân" actions={<Link className="btn" href="/Account">Mở</Link>}>
							Xem/Cập nhật hồ sơ, đổi mật khẩu.
						</Card>
						<Card title="Báo cáo (demo)" actions={<Link className="btn" href="#">Mở</Link>}>
							Đang phát triển.
						</Card>
					</div>
				</Card>
			</main>
		</>
	);
}
