export type AppRole = 'SystemAdmin' | 'BusinessAdmin' | 'HRManager' | 'SaleAdmin' | 'CustomerAdmin' | 'CustomerUser';

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
