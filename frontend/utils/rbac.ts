export type AppRole = 'SystemAdmin' | 'BusinessAdmin' | 'HRManager' | 'SaleAdmin' | 'CustomerAdmin' | 'CustomerUser' | 'PartnerAdmin' | 'Security' | 'YardManager' | 'MaintenanceManager' | 'Accountant';

export function homeFor(role: AppRole): string {
	return '/Dashboard';
}

export function canViewUsersPartners(role?: string): boolean {
	return ['SystemAdmin','BusinessAdmin','HRManager','SaleAdmin','CustomerAdmin'].includes(String(role));
}

export function showInternalForm(role?: string): boolean {
	return ['SystemAdmin','BusinessAdmin','HRManager'].includes(String(role));
}

export function showCustomerForm(role?: string): boolean {
	return ['SystemAdmin','BusinessAdmin','SaleAdmin','CustomerAdmin'].includes(String(role));
}

export function isCustomerRole(role?: string): boolean {
	return ['CustomerAdmin','CustomerUser'].includes(String(role));
}

export function isSaleAdmin(role?: string): boolean {
	return String(role) === 'SaleAdmin';
}

export function isAccountant(role?: string): boolean {
	return String(role) === 'Accountant';
}

export function canUseGate(role?: string): boolean {
	// FE chỉ kiểm tra role; backend sẽ xác thực Gate Mode theo thiết bị
	return ['SaleAdmin','SystemAdmin'].includes(String(role));
}
