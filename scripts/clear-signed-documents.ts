#!/usr/bin/env tsx
/**
 * Clear all signed documents from the database
 * Use this to clean up old/corrupted document data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('Clearing all signed documents...');

	const result = await prisma.signedDocument.deleteMany({});

	console.log(`Deleted ${result.count} signed document(s)`);
	console.log('Database is now clean!');
}

main()
	.then(() => prisma.$disconnect())
	.catch((error) => {
		console.error('Error:', error);
		process.exit(1);
	});
