import { Response } from 'express';
import { AuthRequest } from '../../../shared/middlewares/auth';
import service from '../service/RequestService';
import { createRequestSchema, updateRequestStatusSchema, queryRequestSchema, uploadDocSchema } from '../dto/RequestDtos';

export class RequestController {
	async create(req: AuthRequest, res: Response) {
		const { error, value } = createRequestSchema.validate(req.body);
		if (error) return res.status(400).json({ message: error.message });
		try { return res.status(201).json(await service.createByCustomer(req.user!, value)); } catch (e: any) { return res.status(400).json({ message: e.message }); }
	}
	async createBySale(req: AuthRequest, res: Response) {
		const { error, value } = createRequestSchema.validate(req.body);
		if (error) return res.status(400).json({ message: error.message });
		try { return res.status(201).json(await service.createBySaleAdmin(req.user!, value)); } catch (e: any) { return res.status(400).json({ message: e.message }); }
	}
	async list(req: AuthRequest, res: Response) {
		const { error, value } = queryRequestSchema.validate(req.query);
		if (error) return res.status(400).json({ message: error.message });
		try { return res.json(await service.list(req.user!, value)); } catch (e: any) { return res.status(400).json({ message: e.message }); }
	}
	async updateStatus(req: AuthRequest, res: Response) {
		const { error, value } = updateRequestStatusSchema.validate(req.body);
		if (error) return res.status(400).json({ message: error.message });
		try { return res.json(await service.updateStatus(req.user!, req.params.id, value.status, value.reason)); } catch (e: any) { return res.status(400).json({ message: e.message }); }
	}
	// Documents
	async uploadDoc(req: AuthRequest, res: Response) {
		const { error, value } = uploadDocSchema.validate(req.body);
		if (error) return res.status(400).json({ message: error.message });
		try { return res.status(201).json(await service.uploadDocument(req.user!, req.params.id, value.type, (req as any).file)); } catch (e: any) { return res.status(400).json({ message: e.message }); }
	}
	async listDocs(req: AuthRequest, res: Response) {
		try { return res.json(await service.listDocuments(req.user!, req.params.id)); } catch (e: any) { return res.status(400).json({ message: e.message }); }
	}
	async deleteDoc(req: AuthRequest, res: Response) {
		try { return res.json(await service.deleteDocument(req.user!, req.params.docId, req.body?.reason)); } catch (e: any) { return res.status(400).json({ message: e.message }); }
	}
	// Payment
	async sendPayment(req: AuthRequest, res: Response) {
		try { return res.status(201).json(await service.sendPaymentRequest(req.user!, req.params.id)); } catch (e: any) { return res.status(400).json({ message: e.message }); }
	}
}

export default new RequestController();
