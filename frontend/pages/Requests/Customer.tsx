import Header from '@components/Header';
import Card from '@components/Card';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { api } from '@services/api';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function CustomerRequests(){
	const [form, setForm] = useState({ type: 'IMPORT', container_no: '', eta: '' });
	const { data } = useSWR('/requests?page=1&limit=20', fetcher);
	const [msg, setMsg] = useState('');
	const create = async () => {
		setMsg('');
		try{
			await api.post('/requests', { ...form, eta: form.eta || undefined });
			setMsg('Đã tạo yêu cầu');
			mutate('/requests?page=1&limit=20');
		}catch(e:any){ setMsg(e?.response?.data?.message || 'Lỗi'); }
	};
	return (
		<>
			<Header />
			<main className="container">
				<div className="grid grid-cols-2" style={{gap:16}}>
					<Card title="Tạo yêu cầu">
						<div className="grid" style={{gap:12}}>
							<select value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
								<option value="IMPORT">Nhập</option>
								<option value="EXPORT">Xuất</option>
								<option value="CONVERT">Chuyển đổi</option>
							</select>
							<input placeholder="Mã định danh container (Container ID)" value={form.container_no} onChange={e=>setForm({...form, container_no:e.target.value})} />
							<input type="datetime-local" value={form.eta} onChange={e=>setForm({...form, eta:e.target.value})} />
							<button className="btn" onClick={create}>Tạo yêu cầu</button>
							{msg && <div style={{fontSize:13,color:'#065f46'}}>{msg}</div>}
						</div>
					</Card>
					<Card title="Danh sách yêu cầu">
						<table className="table">
							<thead><tr><th>Loại</th><th>Container</th><th>ETA</th><th>Trạng thái</th></tr></thead>
							<tbody>
								{data?.data?.map((it: any)=>(
									<tr key={it.id}>
										<td>{it.type}</td>
										<td>{it.container_no}</td>
										<td>{it.eta ? new Date(it.eta).toLocaleString() : ''}</td>
										<td>
											{it.status}
											{it.latest_payment && <span style={{marginLeft:8, padding:'2px 6px', border:'1px solid #1e3a8a', color:'#1e3a8a', borderRadius:8, fontSize:12}}>Đã gửi yêu cầu thanh toán</span>}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</Card>
				</div>
			</main>
		</>
	);
}
