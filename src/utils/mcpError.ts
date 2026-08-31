import axios from "axios";

export type McpToolError = {
	message: string;
	status?: number;
	details?: unknown;
};

export const normalizeMcpError = (error: unknown): McpToolError => {
	if (axios.isAxiosError(error)) {
		const status = error.response?.status;
		const data = error.response?.data;

		const message = data?.error || data?.message || error.message || "Klikbase API request failed.";

		return {
			message,
			status,
			details: data,
		};
	}

	if (error instanceof Error) {
		return {
			message: error.message,
		};
	}

	return {
		message: "An unexpected error occurred.",
	};
};
