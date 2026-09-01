import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";

import { createMcpExpressApp } from "@modelcontextprotocol/express";

import { toNodeHandler } from "@modelcontextprotocol/node";

import { requireKlikbaseApiKey, type AuthenticatedMcpRequest } from "./auth/apiKey.js";

import { registerTools } from "./tools/registerTools.js";
import { env } from "./config/env.js";

const createServer = (auth: NonNullable<AuthenticatedMcpRequest["klikbaseAuth"]>) => {
	const server = new McpServer({
		name: "klikbase",
		version: "1.0.0",
	});

	registerTools(server, auth);

	return server;
};

const app = createMcpExpressApp({
	host: "0.0.0.0",

	allowedHosts:
		env.nodeEnv === "production" ? ["mcp.klikbase.com", "klikbase-mcp-server.onrender.com"] : undefined,
});

// ============================================================
// HEALTH
// ============================================================

app.get("/health", (_req, res) => {
	return res.status(200).json({
		success: true,
		service: "klikbase-mcp-server",
		status: "healthy",
	});
});

// ============================================================
// OAUTH PROTECTED RESOURCE METADATA
// ============================================================

app.get("/.well-known/oauth-protected-resource", (_req, res) => {
	const mcpPublicUrl = (process.env.MCP_PUBLIC_URL || `http://localhost:${env.port}`).replace(/\/+$/, "");

	const oauthIssuer = (process.env.OAUTH_ISSUER || "http://localhost:5000").replace(/\/+$/, "");

	return res.status(200).json({
		resource: `${mcpPublicUrl}/mcp`,

		authorization_servers: [oauthIssuer],

		scopes_supported: ["profile", "users:read", "tasks:create"],

		bearer_methods_supported: ["header"],

		resource_name: "Klikbase MCP Server",
	});
});

// ============================================================
// MCP
// ============================================================

app.all("/mcp", requireKlikbaseApiKey, async (req, res) => {
	const authenticatedRequest = req as AuthenticatedMcpRequest;

	const auth = authenticatedRequest.klikbaseAuth;

	if (!auth) {
		return res.status(401).json({
			error: "Unauthorized",
		});
	}

	const mcpHandler = createMcpHandler(() => createServer(auth));

	const nodeHandler = toNodeHandler(mcpHandler);

	return nodeHandler(req, res, req.body);
});

// ============================================================
// 404
// ============================================================

app.use((_req, res) => {
	return res.status(404).json({
		error: "Not Found",
	});
});

// ============================================================
// START SERVER
// ============================================================

const httpServer = app.listen(env.port, "0.0.0.0", () => {
	console.log(`Klikbase MCP server running on port ${env.port}`);

	if (env.nodeEnv === "development") {
		console.log(`MCP endpoint: http://localhost:${env.port}/mcp`);
	}
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

const shutdown = (signal: string) => {
	console.log(`${signal} received. Shutting down...`);

	httpServer.close(() => {
		console.log("HTTP server closed.");

		process.exit(0);
	});

	setTimeout(() => {
		console.error("Forced shutdown after timeout.");

		process.exit(1);
	}, 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("SIGINT", () => shutdown("SIGINT"));
