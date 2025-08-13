import { Router } from 'express';
import controller from './RequestController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireRoles } from '../../../shared/middlewares/rbac';

const uploadDir = path.join(process.cwd(), 'backend', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
    storage: multer.diskStorage({
        destination: (_req: any, _file: any, cb: any) => cb(null, uploadDir),
        filename: (_req: any, file: any, cb: any) => cb(null, `${Date.now()}_${file.originalname}`)
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req: any, file: any, cb: any) => {
        const allowed = ['application/pdf','image/jpeg','image/png'];
        if (allowed.includes(file.mimetype)) cb(null, true); else cb(new Error('Định dạng không hỗ trợ'));
    }
});

const router = Router();

// Customer create/list
router.post('/', requireRoles('CustomerAdmin','CustomerUser','SaleAdmin'), (req, res) => ((req as any).user?.role === 'SaleAdmin' ? controller.createBySale(req as any, res) : controller.create(req as any, res)));
router.get('/', requireRoles('CustomerAdmin','CustomerUser','SaleAdmin','Accountant'), (req, res) => controller.list(req as any, res));

// Status changes (SaleAdmin)
router.patch('/:id/status', requireRoles('SaleAdmin'), (req, res) => controller.updateStatus(req as any, res));

// Documents
router.post('/:id/docs', requireRoles('SaleAdmin','Accountant'), upload.single('file'), (req, res) => controller.uploadDoc(req as any, res));
router.get('/:id/docs', requireRoles('SaleAdmin','Accountant','CustomerAdmin','CustomerUser'), (req, res) => controller.listDocs(req as any, res));
router.delete('/:id/docs/:docId', requireRoles('SaleAdmin','Accountant','SystemAdmin','BusinessAdmin'), (req, res) => controller.deleteDoc(req as any, res));

// Payment request
router.post('/:id/payment-request', requireRoles('SaleAdmin'), (req, res) => controller.sendPayment(req as any, res));

export default router;
