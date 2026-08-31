import type { McpServer } from "@modelcontextprotocol/server";

import type { ApiKeyAuthContext } from "../auth/apiKey.js";
import { normalizeMcpError } from "../utils/mcpError.js";

import { searchClients, searchClientsInputSchema } from "./searchClients.js";

import { searchTeamLeaders, searchTeamLeadersInputSchema } from "./searchTeamLeaders.js";

import { searchAssistants, searchAssistantsInputSchema } from "./searchAssistants.js";

import { createTask, createTaskInputSchema } from "./createTask.js";

export const registerTools = (server: McpServer, auth: ApiKeyAuthContext) => {
	// ============================================================
	// SEARCH CLIENTS
	// ============================================================

	server.registerTool(
		"search_clients",
		{
			title: "Search Klikbase Clients",

			description:
				"Search active Klikbase clients by name, email, or company name. Use this before creating a task when the user refers to a client by name instead of providing a client ID.",

			inputSchema: searchClientsInputSchema,
		},

		async (input) => {
			try {
				const result = await searchClients(input, auth);

				return {
					content: [
						{
							type: "text" as const,
							text: JSON.stringify(result, null, 2),
						},
					],

					structuredContent: result,
				};
			} catch (error) {
				const normalized = normalizeMcpError(error);

				return {
					isError: true,

					content: [
						{
							type: "text" as const,
							text: normalized.message,
						},
					],
				};
			}
		},
	);

	// ============================================================
	// SEARCH IAs
	// ============================================================

	server.registerTool(
		"search_ias",
		{
			title: "Search Klikbase IAs",

			description:
				"Search active Klikbase IAs by name, email, or company name. Use this before creating a task when the user refers to an IA by name instead of providing a User ID.",

			inputSchema: searchAssistantsInputSchema,
		},

		async (input) => {
			try {
				const result = await searchAssistants(input, auth);

				return {
					content: [
						{
							type: "text" as const,
							text: JSON.stringify(result, null, 2),
						},
					],

					structuredContent: result,
				};
			} catch (error) {
				const normalized = normalizeMcpError(error);

				return {
					isError: true,

					content: [
						{
							type: "text" as const,
							text: normalized.message,
						},
					],
				};
			}
		},
	);

	// ============================================================
	// SEARCH TEAM LEADERS
	// ============================================================

	server.registerTool(
		"search_team_leaders",
		{
			title: "Search Klikbase Team Leaders",

			description:
				"Search active Klikbase Team Leaders by name, email, or company name. Use this before creating a task when the user refers to a Team Leader by name instead of providing a User ID.",

			inputSchema: searchTeamLeadersInputSchema,
		},

		async (input) => {
			try {
				const result = await searchTeamLeaders(input, auth);

				return {
					content: [
						{
							type: "text" as const,
							text: JSON.stringify(result, null, 2),
						},
					],

					structuredContent: result,
				};
			} catch (error) {
				const normalized = normalizeMcpError(error);

				return {
					isError: true,

					content: [
						{
							type: "text" as const,
							text: normalized.message,
						},
					],
				};
			}
		},
	);

	// ============================================================
	// CREATE TASK
	// ============================================================

	server.registerTool(
		"create_task",
		{
			title: "Create Klikbase Task",

			description:
				"Create a new task in Klikbase. Only the task title is required. Client, IA, Team Leader, project, task list, due date, priority, description, and labels are optional. Search for users first when the user provides names instead of Klikbase IDs.",

			inputSchema: createTaskInputSchema,
		},

		async (input) => {
			try {
				const result = await createTask(input, auth);

				return {
					content: [
						{
							type: "text" as const,

							text: result?.message ?? JSON.stringify(result, null, 2),
						},
					],

					structuredContent: result,
				};
			} catch (error) {
				const normalized = normalizeMcpError(error);

				return {
					isError: true,

					content: [
						{
							type: "text" as const,
							text: normalized.message,
						},
					],
				};
			}
		},
	);
};
