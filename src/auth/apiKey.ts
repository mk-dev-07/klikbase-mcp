import type { NextFunction, Request, Response } from "express";

export type ApiKeyAuthContext = {
	token: string;

	// Kept for backward compatibility with existing code.
	apiKey?: string;

	authorizationHeader: string;

	authType: "API_KEY" | "OAUTH";
};

export class AuthenticationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AuthenticationError";
	}
}

/**
 * Extract either:
 *
 * Bearer kb_live_...
 * OR
 * Bearer kb_oauth_...
 */
export const extractApiKey = (authorizationHeader?: string | null): ApiKeyAuthContext => {
	if (!authorizationHeader) {
		throw new AuthenticationError("Missing Authorization header.");
	}

	const [scheme, token, ...extra] = authorizationHeader.trim().split(/\s+/);

	if (scheme?.toLowerCase() !== "bearer" || !token || extra.length > 0) {
		throw new AuthenticationError("Invalid Authorization header.");
	}

	// ============================================================
	// API KEY
	// ============================================================

	if (token.startsWith("kb_live_")) {
		return {
			token,
			apiKey: token,
			authorizationHeader: `Bearer ${token}`,
			authType: "API_KEY",
		};
	}

	// ============================================================
	// OAUTH ACCESS TOKEN
	// ============================================================

	if (token.startsWith("kb_oauth_")) {
		return {
			token,
			authorizationHeader: `Bearer ${token}`,
			authType: "OAUTH",
		};
	}

	throw new AuthenticationError("Unsupported Klikbase authentication token.");
};

/**
 * Express request used by MCP routes.
 */
export interface AuthenticatedMcpRequest extends Request {
	klikbaseAuth?: ApiKeyAuthContext;
}

/**
 * MCP authentication middleware.
 *
 * This middleware checks the token FORMAT only.
 *
 * Actual API-key / OAuth-token validation happens
 * in the Klikbase backend when a tool calls:
 *
 * /api/mcp/*
 */
export const requireKlikbaseApiKey = (req: AuthenticatedMcpRequest, res: Response, next: NextFunction) => {
	try {
		req.klikbaseAuth = extractApiKey(req.headers.authorization);

		return next();
	} catch (error) {
		if (error instanceof AuthenticationError) {
			/**
			 * Tell OAuth-aware MCP clients where
			 * authorization metadata can be discovered.
			 */
			const publicUrl = (process.env.MCP_PUBLIC_URL || "http://localhost:3001").replace(/\/+$/, "");

			res.setHeader(
				"WWW-Authenticate",
				`Bearer resource_metadata="${publicUrl}/.well-known/oauth-protected-resource"`,
			);

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
