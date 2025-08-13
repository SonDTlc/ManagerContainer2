import Header from '@components/Header';
import Card from '@components/Card';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { api } from '@services/api';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function DepotRequests(){
	const { data } = useSWR('/requests?page=1&limit=20', fetcher);
	const [msg, setMsg] = useState<{ text: string; ok: boolean }|null>(null);
	const [loadingId, setLoadingId] = useState<string>('');
	const actLabel: Record<string,string> = {
		RECEIVED: 'Tiếp nhận',
		REJECTED: 'Từ chối',
		COMPLETED: 'Hoàn tất',
		EXPORTED: 'Đã xuất kho'
	};
	const change = async (id: string, status: string) => {
		setMsg(null); setLoadingId(id+status);
		try{ 
			let payload: any = { status };
			if (status === 'REJECTED') {
				const reason = window.prompt('Nhập lý do từ chối');
				if (!reason) { setLoadingId(''); return; }
				payload.reason = reason;
			}
			await api.patch(`/requests/${id}/status`, payload); 
			mutate('/requests?page=1&limit=20'); 
			setMsg({ text: `${actLabel[status] || 'Cập nhật'} yêu cầu thành công`, ok: true });
		}catch(e:any){ setMsg({ text: `Không thể ${actLabel[status]?.toLowerCase() || 'cập nhật'}: ${e?.response?.data?.message || 'Lỗi'}`, ok: false }); }
		finally { setLoadingId(''); }
	};
	const sendPayment = async (id: string) => {
		setMsg(null); setLoadingId(id+'PAY');
		try{ 
			await api.post(`/requests/${id}/payment-request`, {}); 
			setMsg({ text: 'Đã gửi yêu cầu thanh toán', ok: true }); 
		}catch(e:any){ setMsg({ text: `Gửi yêu cầu thanh toán thất bại: ${e?.response?.data?.message || 'Lỗi'}`, ok: false }); }
		finally { setLoadingId(''); }
	};
	return (
		<>
			<Header />
			<main className="container">
				<Card title="Yêu cầu dịch vụ (Depot)">
					<table className="table">
						<thead><tr><th>Loại</th><th>Container</th><th>ETA</th><th>Trạng thái</th><th>Mã tra cứu Gate</th><th>Hành động</th></tr></thead>
						<tbody>
							{data?.data?.map((it: any)=>(
								<tr key={it.id}>
									<td>{it.type}</td><td>{it.container_no}</td><td>{it.eta ? new Date(it.eta).toLocaleString() : ''}</td><td>{it.status}</td>
									<td>
										<div style={{display:'flex',gap:8,alignItems:'center'}}>
											<span style={{fontSize:12,color:'#1e3a8a'}}>{it.container_no}</span>
											<button className="btn" onClick={()=>{ try{ navigator.clipboard.writeText(it.container_no); setMsg({ text: 'Đã sao chép mã Gate (container)', ok: true }); }catch{} }}>Sao chép</button>
										</div>
									</td>
									<td style={{display:'flex',gap:8}}>
										{it.status==='PENDING' && <button className="btn" disabled={loadingId===it.id+'RECEIVED'} onClick={()=>change(it.id,'RECEIVED')}>Tiếp nhận</button>}
										{(it.status==='PENDING' || it.status==='RECEIVED') && <button className="btn" disabled={loadingId===it.id+'REJECTED'} onClick={()=>change(it.id,'REJECTED')}>Từ chối</button>}
										{(it.status==='RECEIVED') && <button className="btn" disabled={loadingId===it.id+'COMPLETED'} onClick={()=>change(it.id,'COMPLETED')}>Hoàn tất</button>}
										{(it.status==='RECEIVED' || it.status==='COMPLETED') && <button className="btn" disabled={loadingId===it.id+'EXPORTED'} onClick={()=>change(it.id,'EXPORTED')}>Đã xuất kho</button>}
										{it.status==='COMPLETED' && <button className="btn" disabled={loadingId===it.id+'PAY'} onClick={()=>sendPayment(it.id)}>Gửi yêu cầu thanh toán</button>}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{msg && <div style={{fontSize:13,marginTop:12,color: msg.ok?'#065f46':'#dc2626'}}>{msg.text}</div>}
				</Card>
			</main>
		</>
	);
}
