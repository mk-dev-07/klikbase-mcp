import type { NextFunction, Request, Response } from "express";

export type ApiKeyAuthContext = {
	apiKey: string;
	authorizationHeader: string;
};

export class AuthenticationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AuthenticationError";
	}
}

export const extractApiKey = (authorizationHeader?: string | null): ApiKeyAuthContext => {
	if (!authorizationHeader) {
		throw new AuthenticationError("Missing Authorization header.");
	}

	const [scheme, token, ...extra] = authorizationHeader.trim().split(/\s+/);

	if (scheme?.toLowerCase() !== "bearer" || !token || extra.length > 0) {
		throw new AuthenticationError("Invalid Authorization header. Expected: Bearer kb_live_...");
	}

	if (!token.startsWith("kb_live_")) {
		throw new AuthenticationError("Invalid Klikbase API key format.");
	}

	return {
		apiKey: token,
		authorizationHeader: `Bearer ${token}`,
	};
};

/**
 * Express request type used by MCP routes.
 */
export interface AuthenticatedMcpRequest extends Request {
	klikbaseAuth?: ApiKeyAuthContext;
}

/**
 * MCP API-key middleware.
 *
 * IMPORTANT:
 * This checks the credential format only.
 *
 * Actual API-key authentication is performed by
 * the Klikbase backend when tools call its MCP APIs.
 */
export const requireKlikbaseApiKey = (req: AuthenticatedMcpRequest, res: Response, next: NextFunction) => {
	try {
		req.klikbaseAuth = extractApiKey(req.headers.authorization);

		return next();
	} catch (error) {
		if (error instanceof AuthenticationError) {
			return res.status(401).json({
				error: "Unauthorized",
				message: error.message,
			});
		}

		console.error("MCP authentication middleware error:", error);

		return res.status(500).json({
			error: "Internal authentication error.",
		});
	}
};
