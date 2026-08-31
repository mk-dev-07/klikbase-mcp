import { z } from "zod";

import type { ApiKeyAuthContext } from "../auth/apiKey.js";
import { searchUsers } from "../services/klikbaseApi.js";

export const searchAssistantsInputSchema = z.object({
	query: z
		.string()
		.trim()
		.min(1, "Search query is required.")
		.describe("IA name, email, or company name to search for in Klikbase."),
});

export type SearchAssistantsInput = z.infer<typeof searchAssistantsInputSchema>;

export const searchAssistants = async (input: SearchAssistantsInput, auth: ApiKeyAuthContext) => {
	const validatedInput = searchAssistantsInputSchema.parse(input);

	const result = await searchUsers(auth, {
		query: validatedInput.query,
		role: "IA",
	});

	const assistants = Array.isArray(result?.users) ? result.users : [];

	return {
		count: assistants.length,

		assistants: assistants.map((assistant: any) => ({
			id: assistant.id,
			name: assistant.fullName,
			email: assistant.email,
			companyName: assistant.companyName || "",
		})),
	};
};
