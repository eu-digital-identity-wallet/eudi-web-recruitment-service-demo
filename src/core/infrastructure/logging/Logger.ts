/**
 * Structured Logging Service
 *
 * Provides structured logging with:
 * - Log levels (debug, info, warn, error)
 * - Automatic PII masking for sensitive fields
 * - Structured context for better observability
 * - Type-safe logging methods
 */

export enum LogLevel {
	DEBUG = 'debug',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error',
}

interface LogContext {
	[key: string]: unknown;
}

/**
 * Fields that contain sensitive PII data that should be masked
 */
const SENSITIVE_FIELDS = new Set([
	'given_name',
	'family_name',
	'birth_date',
	'birthdate',
	'email',
	'phone',
	'phone_number',
	'address',
	'street_address',
	'postal_code',
	'tax_id',
	'ssn',
	'national_id',
	'passport',
	'credential',
	'credentials',
	'token',
	'access_token',
	'refresh_token',
	'id_token',
	'jwt',
	'secret',
	'password',
	'pin',
	'otp',
	'certificate',
	'private_key',
	'signature',
]);

/**
 * Recursively mask sensitive data in objects
 */
function maskSensitiveData(data: unknown): unknown {
	if (data === null || data === undefined) {
		return data;
	}

	if (typeof data === 'string') {
		// If it's a long string that looks like a token/JWT, mask it
		if (data.length > 50 && (data.includes('.') || data.match(/^[A-Za-z0-9_-]{20,}$/))) {
			return `${data.substring(0, 8)}...[MASKED]`;
		}
		return data;
	}

	if (Array.isArray(data)) {
		return data.map((item) => maskSensitiveData(item));
	}

	if (typeof data === 'object') {
		const masked: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
			const lowerKey = key.toLowerCase();

			// Check if this field is sensitive
			const isSensitive = SENSITIVE_FIELDS.has(lowerKey) || lowerKey.includes('secret');

			if (isSensitive) {
				// Mask the value but show first 2 chars for debugging
				if (typeof value === 'string' && value.length > 0) {
					masked[key] = value.length > 2 ? `${value.substring(0, 2)}***[MASKED]` : '***[MASKED]';
				} else {
					masked[key] = '[MASKED]';
				}
			} else {
				// Recursively mask nested objects
				masked[key] = maskSensitiveData(value);
			}
		}
		return masked;
	}

	return data;
}

/**
 * Logger class with structured logging and PII masking
 */
export class Logger {
	private serviceName: string;
	private minLevel: LogLevel;

	constructor(serviceName: string, minLevel: LogLevel = LogLevel.INFO) {
		this.serviceName = serviceName;
		this.minLevel = minLevel;
	}

	private shouldLog(level: LogLevel): boolean {
		const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
		const currentLevelIndex = levels.indexOf(this.minLevel);
		const messageLevelIndex = levels.indexOf(level);
		return messageLevelIndex >= currentLevelIndex;
	}

	private log(level: LogLevel, message: string, context?: LogContext): void {
		if (!this.shouldLog(level)) {
			return;
		}

		const logEntry = {
			timestamp: new Date().toISOString(),
			level,
			service: this.serviceName,
			message,
			...(context ? { context: maskSensitiveData(context) } : {}),
		};

		// In production, this would go to a proper logging service (e.g., Winston, Pino)
		// For now, we use console with structured format
		const logMethod = level === LogLevel.ERROR ? console.error : console.log;
		logMethod(JSON.stringify(logEntry));
	}

	debug(message: string, context?: LogContext): void {
		this.log(LogLevel.DEBUG, message, context);
	}

	info(message: string, context?: LogContext): void {
		this.log(LogLevel.INFO, message, context);
	}

	warn(message: string, context?: LogContext): void {
		this.log(LogLevel.WARN, message, context);
	}

	error(message: string, error?: Error, context?: LogContext): void {
		const errorContext = {
			...context,
			...(error
				? {
						error: {
							message: error.message,
							name: error.name,
							stack: error.stack,
						},
					}
				: {}),
		};
		this.log(LogLevel.ERROR, message, errorContext);
	}
}

/**
 * Factory function to create loggers for different services
 */
export function createLogger(serviceName: string, minLevel?: LogLevel): Logger {
	// In production, you might read LOG_LEVEL from environment variables
	const defaultLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
	return new Logger(serviceName, minLevel || defaultLevel);
}
