import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(){
	const email = 'admin@smartlog.local';
	const password = 'Admin@1234';
	const password_hash = await bcrypt.hash(password, 10);
	await prisma.user.upsert({
		where: { email },
		update: {},
		create: {
			email,
			full_name: 'System Admin',
			role: 'SystemAdmin',
			status: 'ACTIVE',
			password_hash
		}
	});
	console.log('Seeded SystemAdmin:', email, password);
}

main().finally(()=>prisma.$disconnect());
