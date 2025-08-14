import { ReactNode } from 'react';

export default function Card({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }){
	return (
		<div className="card" style={{transition:'box-shadow .2s ease, transform .2s ease'}}>
			<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
				<h3 style={{margin:0}}>{title}</h3>
				{actions}
			</div>
			<div>{children}</div>
		</div>
	);
}
