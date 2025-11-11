import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';
import { Service } from 'typedi';

/**
 * Service responsible for generating professional PDF contracts
 * Uses pdf-lib for creating well-formatted, production-ready documents
 * Domain: Document Signing
 */
@Service()
export class ContractPdfGeneratorService {
	// Page dimensions (US Letter)
	private readonly PAGE_WIDTH = 612;
	private readonly PAGE_HEIGHT = 792;

	// Margins
	private readonly MARGIN_LEFT = 50;
	private readonly MARGIN_RIGHT = 50;
	private readonly MARGIN_TOP = 50;
	private readonly MARGIN_BOTTOM = 50;

	// Colors
	private readonly COLOR_PRIMARY = rgb(0.1, 0.2, 0.4); // Dark blue
	private readonly COLOR_TEXT = rgb(0, 0, 0); // Black
	private readonly COLOR_SECONDARY = rgb(0.4, 0.4, 0.4); // Gray

	/**
	 * Generate an employment contract PDF
	 *
	 * @param contractData - Data for the contract
	 * @returns PDF as Buffer
	 */
	async generateEmploymentContract(contractData: {
		applicationId: string;
		candidateGivenName: string | null;
		candidateFamilyName: string | null;
		candidateEmail: string | null;
		candidateDateOfBirth: string | null;
		jobTitle: string;
		jobDescription: string;
		companyName?: string;
		startDate?: string;
	}): Promise<Buffer> {
		// Create a new PDF document
		const pdfDoc = await PDFDocument.create();

		// Add a page
		const page = pdfDoc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);

		// Embed fonts
		const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
		const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

		// Set initial Y position
		let yPosition = this.PAGE_HEIGHT - this.MARGIN_TOP;

		// Helper function to draw text (sanitize to remove newlines and special chars)
		const drawText = (
			text: string,
			options: {
				size: number;
				font?: typeof boldFont;
				color?: ReturnType<typeof rgb>;
				lineHeight?: number;
			},
		) => {
			const font = options.font || regularFont;
			const color = options.color || this.COLOR_TEXT;
			const lineHeight = options.lineHeight || options.size * 1.5;

			// Remove newlines and other special characters that pdf-lib can't encode
			const sanitizedText = text.replace(/[\n\r\t]/g, ' ').trim();

			page.drawText(sanitizedText, {
				x: this.MARGIN_LEFT,
				y: yPosition,
				size: options.size,
				font: font,
				color: color,
			});

			yPosition -= lineHeight;
		};

		// Helper function to add spacing
		const addSpace = (amount: number) => {
			yPosition -= amount;
		};

		// Generate contract date
		const contractDate = new Date().toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

		// Title
		drawText('EMPLOYMENT CONTRACT', {
			size: 24,
			font: boldFont,
			color: this.COLOR_PRIMARY,
			lineHeight: 30,
		});

		addSpace(10);

		// Horizontal line under title
		page.drawLine({
			start: { x: this.MARGIN_LEFT, y: yPosition },
			end: { x: this.PAGE_WIDTH - this.MARGIN_RIGHT, y: yPosition },
			thickness: 2,
			color: this.COLOR_PRIMARY,
		});

		addSpace(20);

		// Contract metadata
		drawText(`Contract Date: ${contractDate}`, {
			size: 10,
			color: this.COLOR_SECONDARY,
			lineHeight: 14,
		});

		drawText(`Reference ID: ${contractData.applicationId}`, {
			size: 10,
			color: this.COLOR_SECONDARY,
			lineHeight: 14,
		});

		addSpace(20);

		// Section: Parties
		drawText('1. PARTIES', {
			size: 14,
			font: boldFont,
			lineHeight: 20,
		});

		addSpace(5);

		drawText('This Employment Contract is entered into between:', {
			size: 11,
			lineHeight: 16,
		});

		addSpace(5);

		// Employer
		const companyName = contractData.companyName || 'The Employer';
		drawText(`Employer: ${companyName}`, {
			size: 11,
			font: boldFont,
			lineHeight: 16,
		});

		addSpace(5);

		drawText('and', {
			size: 11,
			lineHeight: 16,
		});

		addSpace(5);

		// Employee
		const candidateName =
			`${contractData.candidateGivenName || ''} ${contractData.candidateFamilyName || ''}`.trim() ||
			'[Employee Name]';

		drawText(`Employee: ${candidateName}`, {
			size: 11,
			font: boldFont,
			lineHeight: 16,
		});

		if (contractData.candidateDateOfBirth) {
			drawText(`Date of Birth: ${contractData.candidateDateOfBirth}`, {
				size: 10,
				color: this.COLOR_SECONDARY,
				lineHeight: 14,
			});
		}

		if (contractData.candidateEmail) {
			drawText(`Email: ${contractData.candidateEmail}`, {
				size: 10,
				color: this.COLOR_SECONDARY,
				lineHeight: 14,
			});
		}

		addSpace(20);

		// Section: Position
		drawText('2. POSITION', {
			size: 14,
			font: boldFont,
			lineHeight: 20,
		});

		addSpace(5);

		drawText(`Job Title: ${contractData.jobTitle}`, {
			size: 11,
			lineHeight: 16,
		});

		addSpace(5);

		// Job description (wrap text if too long)
		const descriptionLines = this.wrapText(
			contractData.jobDescription,
			this.PAGE_WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT,
			regularFont,
			11,
		);

		drawText('Job Description:', {
			size: 11,
			font: boldFont,
			lineHeight: 16,
		});

		for (const line of descriptionLines) {
			drawText(line, {
				size: 10,
				lineHeight: 14,
			});
		}

		addSpace(20);

		// Section: Terms
		drawText('3. TERMS AND CONDITIONS', {
			size: 14,
			font: boldFont,
			lineHeight: 20,
		});

		addSpace(5);

		const startDate = contractData.startDate || '[To be determined]';
		drawText(`Start Date: ${startDate}`, {
			size: 11,
			lineHeight: 16,
		});

		addSpace(5);

		drawText(
			'Both parties agree to the terms and conditions as discussed and outlined in this contract.',
			{
				size: 11,
				lineHeight: 16,
			},
		);

		addSpace(5);

		drawText(
			'This contract is subject to the laws and regulations of the applicable jurisdiction.',
			{
				size: 11,
				lineHeight: 16,
			},
		);

		addSpace(30);

		// Section: Signatures
		drawText('4. SIGNATURES', {
			size: 14,
			font: boldFont,
			lineHeight: 20,
		});

		addSpace(10);

		drawText('By signing this document with your qualified electronic signature (QES),', {
			size: 10,
			lineHeight: 14,
		});

		drawText('both parties acknowledge and accept the terms of this employment contract.', {
			size: 10,
			lineHeight: 14,
		});

		addSpace(30);

		// Signature lines - capture Y position before drawing any text
		const signatureLineY = yPosition;

		// Draw both signature lines at the same Y position
		// Employee signature line (left)
		page.drawLine({
			start: { x: this.MARGIN_LEFT, y: signatureLineY },
			end: { x: this.MARGIN_LEFT + 200, y: signatureLineY },
			thickness: 1,
			color: this.COLOR_TEXT,
		});

		// Employer signature line (right)
		page.drawLine({
			start: { x: this.PAGE_WIDTH - this.MARGIN_RIGHT - 200, y: signatureLineY },
			end: { x: this.PAGE_WIDTH - this.MARGIN_RIGHT, y: signatureLineY },
			thickness: 1,
			color: this.COLOR_TEXT,
		});

		// Move Y position down for text under signature lines
		yPosition -= 20;
		const labelY = yPosition;

		// Employee signature text (left)
		page.drawText('Employee Signature (Digital)', {
			x: this.MARGIN_LEFT,
			y: labelY,
			size: 9,
			font: regularFont,
			color: this.COLOR_SECONDARY,
		});

		// Employer signature text (right) - at same Y position
		page.drawText('Employer Signature', {
			x: this.PAGE_WIDTH - this.MARGIN_RIGHT - 200,
			y: labelY,
			size: 9,
			font: regularFont,
			color: this.COLOR_SECONDARY,
		});

		// Move down for names
		yPosition -= 18;
		const nameY = yPosition;

		// Employee name (left)
		page.drawText(candidateName, {
			x: this.MARGIN_LEFT,
			y: nameY,
			size: 10,
			font: regularFont,
			color: this.COLOR_TEXT,
		});

		// Company name (right) - at same Y position
		page.drawText(companyName, {
			x: this.PAGE_WIDTH - this.MARGIN_RIGHT - 200,
			y: nameY,
			size: 10,
			font: regularFont,
			color: this.COLOR_TEXT,
		});

		// Serialize the PDF to bytes
		const pdfBytes = await pdfDoc.save();

		return Buffer.from(pdfBytes);
	}

	/**
	 * Wrap text to fit within a specified width
	 * Simple word-wrapping algorithm
	 */
	private wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
		// Sanitize text first - remove newlines and tabs
		const sanitizedText = text
			.replace(/[\n\r\t]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

		const words = sanitizedText.split(' ');
		const lines: string[] = [];
		let currentLine = '';

		for (const word of words) {
			const testLine = currentLine ? `${currentLine} ${word}` : word;
			const testWidth = font.widthOfTextAtSize(testLine, fontSize);

			if (testWidth > maxWidth && currentLine) {
				lines.push(currentLine);
				currentLine = word;
			} else {
				currentLine = testLine;
			}
		}

		if (currentLine) {
			lines.push(currentLine);
		}

		return lines;
	}
}
