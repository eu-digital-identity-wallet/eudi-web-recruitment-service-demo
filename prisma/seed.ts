/* prisma/seed.ts */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureJob(params: { title: string; description: string; requiresDL?: boolean }) {
	const existing = await prisma.jobPosting.findFirst({ where: { title: params.title } });
	if (existing) return existing;

	return prisma.jobPosting.create({
		data: {
			title: params.title,
			description: params.description,
		},
	});
}

async function main() {
	console.log('🌱 Seeding database...');
	await ensureJob({
		title: 'Marine Superintendent',
		requiresDL: false,
		description: [
			'SeaFarer S.A., a well-established Shipping Company located in Malta, is seeking to employ a Marine Superintendent.',
			'',
			'Key responsibilities include:',
			'• Vessels’ preparation for Rightship inspections',
			'• Attending Rightship inspections onboard',
			'• Cooperating with HSSQE Dept. on the nature of Rightship observations and/or deficiencies noted',
			'• Internal Audits onboard',
			'• Attendances onboard and follow-ups on maintenance program progress',
			'• Ensuring vessels are operating in accordance with safety/environmental/energy standards of the Company',
			'• Follow-ups on Defects/Deficiencies',
			'',
			'All applications will be treated with confidentiality.',
		].join('\n'),
	});

	await ensureJob({
		title: 'Captain',
		requiresDL: false,
		description: [
			'SeaFarer S.A. is looking for an experienced Captain to lead vessel operations and ensure safe, compliant voyages. 1',
			'',
			'Key responsibilities include:',
			'• Overall command of vessel navigation and safety management',
			'• Leadership of deck crew and coordination with engine and shoreside teams',
			'• Compliance with flag, port state, ISM/ISPS and company policies',
			'• Voyage planning, weather routing and risk assessments',
			'• Oversight of cargo operations, stability and documentation',
			'• Incident reporting and continuous improvement initiatives',
			'',
			'Diploma and Seafarer Certificate are optional and considered an asset.',
			'All applications will be treated with confidentiality.',
		].join('\n'),
	});

	console.log('✅ Seed complete');
}

main()
	.catch((e) => {
		console.error('Seed error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
