import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { connectDatabase, appConfig } from './shared/config/database';
import { authenticate } from './shared/middlewares/auth';

// Routes
import authRoutes from './modules/auth/controller/authRoutes';
import userRoutes from './modules/users/controller/userRoutes';
import customerRoutes from './modules/customers/controller/customerRoutes';
import partnerRoutes from './modules/partners/controller/partnerRoutes';
import auditRoutes from './modules/audit/controller/auditRoutes';

const app = express();
app.use(helmet());
app.use(cors());

// Logging to file
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/users', authenticate, userRoutes);
app.use('/customers', authenticate, customerRoutes);
app.use('/partners', authenticate, partnerRoutes);
app.use('/audit', authenticate, auditRoutes);

const start = async () => {
	await connectDatabase();
	app.listen(appConfig.port, () => console.log(`[API] listening on ${appConfig.port}`));
};

start();

export default app;
