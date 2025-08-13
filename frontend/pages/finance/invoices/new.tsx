import Header from '@components/Header';
import Card from '@components/Card';
import { useState } from 'react';
import { financeApi, InvoiceItemInput } from '@services/finance';
import Router from 'next/router';

export default function NewInvoice(){
  const [form, setForm] = useState<any>({ customer_id: '', currency: 'VND', issue_date: '', due_date: '', notes: '' });
  const [items, setItems] = useState<InvoiceItemInput[]>([{ service_code: 'GATE_IN', description:'Dịch vụ', qty: 1, unit_price: 100000 }]);
  const [msg, setMsg] = useState('');
  const addItem = ()=> setItems(prev=>[...prev, { service_code:'', description:'', qty:1, unit_price:0 }]);
  const save = async ()=>{
    setMsg('');
    try{ const inv = await financeApi.createInvoice({ ...form, items }); setMsg('Đã tạo'); Router.push(`/finance/invoices/${inv.id}`); }
    catch(e:any){ setMsg(e?.response?.data?.message || 'Lỗi tạo hóa đơn'); }
  };
  return (
    <>
      <Header />
      <main className="container">
        <Card title="Tạo hóa đơn (DRAFT)">
          <div className="grid" style={{gap:8}}>
            <input placeholder="Customer ID" value={form.customer_id} onChange={e=>setForm({...form, customer_id:e.target.value})} />
            <div style={{fontWeight:600}}>Items</div>
            {items.map((it,idx)=> (
              <div key={idx} style={{display:'grid', gridTemplateColumns:'120px 1fr 120px 140px', gap:8, alignItems:'center'}}>
                <input placeholder="Service" value={it.service_code} onChange={e=>setItems(prev=>{ const n=[...prev]; n[idx]={...n[idx], service_code:e.target.value}; return n; })} />
                <input placeholder="Mô tả" value={it.description} onChange={e=>setItems(prev=>{ const n=[...prev]; n[idx]={...n[idx], description:e.target.value}; return n; })} />
                <input type="number" step="0.001" placeholder="Qty" value={it.qty} onChange={e=>setItems(prev=>{ const n=[...prev]; n[idx]={...n[idx], qty:Number(e.target.value)}; return n; })} />
                <input type="number" step="0.0001" placeholder="Unit price" value={it.unit_price} onChange={e=>setItems(prev=>{ const n=[...prev]; n[idx]={...n[idx], unit_price:Number(e.target.value)}; return n; })} />
              </div>
            ))}
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={addItem}>Thêm dòng</button>
              <button className="btn" onClick={save}>Lưu</button>
            </div>
            {msg && <div style={{fontSize:12, color:'#1e3a8a'}}>{msg}</div>}
          </div>
        </Card>
      </main>
    </>
  );
}


