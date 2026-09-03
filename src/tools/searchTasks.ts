import { z } from "zod";

import type { ApiKeyAuthContext } from "../auth/apiKey.js";
import { searchTasks as searchTasksApi } from "../services/klikbaseApi.js";

export const searchTasksInputSchema = z.object({
	query: z.string().min(1).describe("Task title, partial title, link ID, or other identifying text."),
});

export type SearchTasksInput = z.infer<typeof searchTasksInputSchema>;

export const searchTasks = async (input: SearchTasksInput, auth: ApiKeyAuthContext) => {
	const validated = searchTasksInputSchema.parse(input);

	return searchTasksApi(auth, validated.query);
};
