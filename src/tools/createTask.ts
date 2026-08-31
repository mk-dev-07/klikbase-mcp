import { z } from "zod";

import type { ApiKeyAuthContext } from "../auth/apiKey.js";
import { createTask as createKlikbaseTask } from "../services/klikbaseApi.js";

export const createTaskInputSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Task title is required.")
		.describe("The title of the Klikbase task. This is the only required field."),

	description: z
		.string()
		.optional()
		.describe("Optional task description containing additional details or instructions."),

	clientUserId: z
		.number()
		.int()
		.positive()
		.optional()
		.describe(
			"Optional Klikbase User ID of the client associated with this task. Use search_clients first when only a client name is known.",
		),

	assistantUserIds: z
		.array(z.number().int().positive())
		.optional()
		.describe(
			"Optional array of Klikbase User IDs for IAs assigned to the task. Use search_assistants first when only names are known.",
		),

	teamLeaderUserIds: z
		.array(z.number().int().positive())
		.optional()
		.describe(
			"Optional array of Klikbase User IDs for Team Leaders assigned to the task. Use search_team_leaders first when only names are known.",
		),

	priority: z
		.enum(["LOW", "MEDIUM", "HIGH"])
		.optional()
		.describe("Optional task priority. Defaults to MEDIUM when omitted."),

	dueDate: z.string().optional().describe("Optional due date as an ISO 8601 date-time string."),

	taskListId: z
		.number()
		.int()
		.positive()
		.optional()
		.describe(
			"Optional Klikbase task list ID. If omitted, the Klikbase backend may use the global To Do list.",
		),

	projectId: z
		.number()
		.int()
		.positive()
		.optional()
		.describe("Optional Klikbase project ID associated with the task."),

	labels: z.array(z.string()).optional().describe("Optional labels to attach to the task."),
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

export const createTask = async (input: CreateTaskInput, auth: ApiKeyAuthContext) => {
	const validatedInput = createTaskInputSchema.parse(input);

	const result = await createKlikbaseTask(auth, {
		title: validatedInput.title,

		...(validatedInput.description !== undefined
			? {
					description: validatedInput.description,
				}
			: {}),

		...(validatedInput.clientUserId !== undefined
			? {
					clientUserId: validatedInput.clientUserId,
				}
			: {}),

		...(validatedInput.assistantUserIds !== undefined
			? {
					assistantUserIds: validatedInput.assistantUserIds,
				}
			: {}),

		...(validatedInput.teamLeaderUserIds !== undefined
			? {
					teamLeaderUserIds: validatedInput.teamLeaderUserIds,
				}
			: {}),

		...(validatedInput.priority !== undefined
			? {
					priority: validatedInput.priority,
				}
			: {}),

		...(validatedInput.dueDate !== undefined
			? {
					dueDate: validatedInput.dueDate,
				}
			: {}),

		...(validatedInput.taskListId !== undefined
			? {
					taskListId: validatedInput.taskListId,
				}
			: {}),

		...(validatedInput.projectId !== undefined
			? {
					projectId: validatedInput.projectId,
				}
			: {}),

		...(validatedInput.labels !== undefined
			? {
					labels: validatedInput.labels,
				}
			: {}),
	});

	return result;
};
