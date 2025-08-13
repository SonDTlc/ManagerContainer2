import { prisma } from '../../../shared/config/database';

export class RequestRepository {
	create(data: any) { return prisma.serviceRequest.create({ data }); }
	update(id: string, data: any) { return prisma.serviceRequest.update({ where: { id }, data }); }
	findById(id: string) { return prisma.serviceRequest.findUnique({ where: { id } }); }
	list(filter: any, skip: number, take: number) {
		return prisma.serviceRequest.findMany({ where: filter, orderBy: { createdAt: 'desc' }, skip, take });
	}
	count(filter: any) { return prisma.serviceRequest.count({ where: filter }); }

	// Documents
	createDoc(data: any) { return prisma.documentFile.create({ data }); }
	listDocs(request_id: string) { return prisma.documentFile.findMany({ where: { request_id, deleted_at: null }, orderBy: [{ type: 'asc' }, { createdAt: 'desc' }] }); }
	getDoc(id: string) { return prisma.documentFile.findUnique({ where: { id } }); }
	softDeleteDoc(id: string, deleted_by: string, reason?: string) { return prisma.documentFile.update({ where: { id }, data: { deleted_at: new Date(), deleted_by, delete_reason: reason } }); }
	getLastDocVersion(request_id: string, type: string) { return prisma.documentFile.findFirst({ where: { request_id, type }, orderBy: { version: 'desc' } }); }

	// Payment requests
	createPayment(data: any) { return prisma.paymentRequest.create({ data }); }
	listPayments(request_id: string) { return prisma.paymentRequest.findMany({ where: { request_id }, orderBy: { createdAt: 'desc' } }); }
	getLatestPayment(request_id: string) { return prisma.paymentRequest.findFirst({ where: { request_id }, orderBy: { createdAt: 'desc' } }); }
}

export default new RequestRepository();
