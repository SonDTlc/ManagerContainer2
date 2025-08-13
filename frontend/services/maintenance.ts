import { api } from './api';

export type RepairItemInput = { inventory_item_id: string; quantity: number };

export const maintenanceApi = {
  // Repairs
  async listRepairs(status?: string) {
    const { data } = await api.get('/maintenance/repairs', { params: { status } });
    return data as any[];
  },
  async createRepair(payload: { code: string; equipment_id: string; problem_description: string; estimated_cost?: number; items?: RepairItemInput[] }) {
    const { data } = await api.post('/maintenance/repairs', payload);
    return data;
  },
  async approveRepair(id: string, manager_comment?: string) {
    const { data } = await api.post(`/maintenance/repairs/${id}/approve`, { manager_comment });
    return data;
  },
  async rejectRepair(id: string, manager_comment?: string) {
    const { data } = await api.post(`/maintenance/repairs/${id}/reject`, { manager_comment });
    return data;
  },
  // Inventory
  async listInventory(params?: { q?: string; low?: boolean }) {
    const { data } = await api.get('/maintenance/inventory/items', { params });
    return data as any[];
  },
  async updateInventory(id: string, payload: { qty_on_hand: number; reorder_point: number }) {
    const { data } = await api.put(`/maintenance/inventory/items/${id}`, payload);
    return data;
  },
  // Equipments (for select)
  async listEquipments() {
    const { data } = await api.get('/maintenance/equipments');
    return data as any[];
  }
};


