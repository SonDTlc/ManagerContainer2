import { useState } from 'react';
import Header from '@components/Header';
import { api } from '@services/api';
import Link from 'next/link';
import { homeFor } from '@utils/rbac';
import styles from './Login.module.css';

export default function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const onLogin = async () => {
		setError('');
		try {
			const res = await api.post('/auth/login', { username, password });
			if (typeof window !== 'undefined') {
				localStorage.setItem('token', res.data.access_token);
				localStorage.setItem('refresh_token', res.data.refresh_token);
				localStorage.setItem('user_id', res.data.user._id || res.data.user.id);
				const dest = homeFor(res.data.user.role || res.data.user.roles?.[0]);
				window.location.href = dest;
			}
		} catch (e: any) {
			const code = e?.response?.status;
			if (code === 423) {
				setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
			} else {
				setError('Tên đăng nhập hoặc mật khẩu không chính xác');
			}
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter') {
			onLogin();
		}
	};

	return (
		<>
			<Header />
			<main className={styles.wrapper}>
				<div className={styles.loginBox}>
					<div className={styles.header}>
						<h2 className={styles.title}>Đăng nhập</h2>
						<p className={styles.subtitle}>Nhập thông tin để truy cập hệ thống</p>
					</div>

					<div className={styles.form} onKeyPress={handleKeyPress}>
						<div className={styles.formGroup}>
							<label htmlFor="email" className={styles.label}>Email / Tên đăng nhập</label>
							<input
								id="email"
								className={styles.input}
								type="text"
								placeholder="email@company.com"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="password" className={styles.label}>Mật khẩu</label>
							<input
								id="password"
								className={styles.input}
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>

						{error && <div className={styles.error}>{error}</div>}

						<button className={styles.button} onClick={onLogin}>
							Đăng nhập
						</button>

						<div className={styles.footer}>
							Chưa có mật khẩu?{' '}
							<Link href="/Register">Kích hoạt tài khoản (Accept Invite)</Link>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
