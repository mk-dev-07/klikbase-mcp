import "dotenv/config";

const requiredEnv = (name: string): string => {
	const value = process.env[name];

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
};

const port = Number(process.env.PORT ?? 3001);

if (!Number.isInteger(port) || port <= 0) {
	throw new Error("PORT must be a valid positive integer.");
}

export const env = {
	nodeEnv: process.env.NODE_ENV ?? "development",

	port,

	klikbaseApiUrl: requiredEnv("KLIKBASE_API_URL").replace(/\/+$/, ""),
} as const;
