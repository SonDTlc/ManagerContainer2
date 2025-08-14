import Header from '@components/Header';
import Card from '@components/Card';
import useSWR from 'swr';
import { useState } from 'react';
import { reportsApi } from '@services/reports';

export default function ReportContainers(){
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const key = ['report_containers', q, status, page].join(':');
  const { data, mutate } = useSWR(key, async ()=> reportsApi.listContainers({ q: q || undefined, status: status || undefined, page, pageSize }));

  return (
    <>
      <Header />
      <main className="container">
        <div className="grid" style={{gap:16}}>
          <Card title="Danh sách container">
            <div style={{display:'flex', gap:8, marginBottom:8}}>
              <input placeholder="Tìm container_no" value={q} onChange={e=>{ setQ(e.target.value); setPage(1); mutate(); }} />
              <select value={status} onChange={e=>{ setStatus(e.target.value); setPage(1); mutate(); }}>
                <option value="">Tất cả trạng thái</option>
                <option value="OCCUPIED">OCCUPIED</option>
                <option value="RESERVED">RESERVED</option>
                <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
              </select>
            </div>
            <table className="table">
              <thead><tr><th>Container</th><th>Yard</th><th>Block</th><th>Slot</th><th>Slot Status</th><th>DEM</th><th>DET</th></tr></thead>
              <tbody>
                {(data?.items||[]).map((it:any)=>(
                  <tr key={it.container_no}>
                    <td>{it.container_no}</td>
                    <td>{it.yard_name || '-'}</td>
                    <td>{it.block_code || '-'}</td>
                    <td>{it.slot_code || '-'}</td>
                    <td>{it.slot_status || '-'}</td>
                    <td>{it.dem_date ? new Date(it.dem_date).toLocaleDateString() : '-'}</td>
                    <td>{it.det_date ? new Date(it.det_date).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button className="btn" disabled={(data?.page||1)<=1} onClick={()=>{ setPage(p=>p-1); mutate(); }}>Prev</button>
              <div style={{alignSelf:'center'}}>Trang {data?.page||1} / {Math.max(1, Math.ceil((data?.total||0)/pageSize))}</div>
              <button className="btn" disabled={(data?.page||1) >= Math.ceil((data?.total||0)/pageSize)} onClick={()=>{ setPage(p=>p+1); mutate(); }}>Next</button>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}


