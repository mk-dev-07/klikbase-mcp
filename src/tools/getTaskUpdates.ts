import { z } from "zod";

import type { ApiKeyAuthContext } from "../auth/apiKey.js";
import { getTaskUpdates as getTaskUpdatesApi } from "../services/klikbaseApi.js";

// ============================================================
// INPUT SCHEMA
// ============================================================

export const getTaskUpdatesInputSchema = z.object({
	taskId: z.number().int().positive(),

	since: z
		.string()
		.optional()
		.describe("Optional ISO date/time. Only return task updates created since this time."),
});

export type GetTaskUpdatesInput = z.infer<typeof getTaskUpdatesInputSchema>;

// ============================================================
// GET TASK UPDATES
// ============================================================

export const getTaskUpdates = async (input: GetTaskUpdatesInput, auth: ApiKeyAuthContext) => {
	const validatedInput = getTaskUpdatesInputSchema.parse(input);

	return getTaskUpdatesApi(auth, validatedInput.taskId, validatedInput.since);
};
