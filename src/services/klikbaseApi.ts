import axios from "axios";
import { env } from "../config/env.js";

const api = axios.create({
	baseURL: env.klikbaseApiUrl,
	timeout: 15000,
	headers: {
		"Content-Type": "application/json",
	},
});

export type KlikbaseAuth = {
	authorizationHeader: string;
};

export const searchUsers = async (
	auth: KlikbaseAuth,
	params: {
		query: string;
		role?: "CLIENT" | "IA" | "TEAM_LEADER";
	},
) => {
	const response = await api.get("/api/mcp/users/search", {
		params,
		headers: {
			Authorization: auth.authorizationHeader,
		},
	});

	return response.data;
};

export const createTask = async (
	auth: KlikbaseAuth,
	payload: {
		title: string;
		description?: string;
		clients?: number[];
		assistantUserIds?: number[];
		teamLeaderUserIds?: number[];
		dueDate?: string;
		taskListId?: number;
		projectId?: number;
		labels?: string[];
	},
) => {
	const response = await api.post("/api/mcp/tasks", payload, {
		headers: {
			Authorization: auth.authorizationHeader,
		},
	});

	return response.data;
};

export const getTaskUpdates = async (auth: KlikbaseAuth, taskId: number, since?: string) => {
	const response = await api.get(`/api/mcp/tasks/${taskId}/updates`, {
		params: since
			? {
					since,
				}
			: undefined,

		headers: {
			Authorization: auth.authorizationHeader,
		},
	});

	return response.data;
};

export const searchTasks = async (auth: KlikbaseAuth, query: string) => {
	const response = await api.get("/api/mcp/tasks/search", {
		params: {
			query,
		},

		headers: {
			Authorization: auth.authorizationHeader,
		},
	});

	return response.data;
};
