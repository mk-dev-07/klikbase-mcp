import { z } from "zod";
import type { ApiKeyAuthContext } from "../auth/apiKey.js";
import { searchUsers } from "../services/klikbaseApi.js";

export const searchClientsInputSchema = z.object({
	query: z
		.string()
		.trim()
		.min(1, "Search query is required.")
		.describe("Client name, email, or company name to search for in Klikbase."),
});

export type SearchClientsInput = z.infer<typeof searchClientsInputSchema>;

export const searchClients = async (input: SearchClientsInput, auth: ApiKeyAuthContext) => {
	const validatedInput = searchClientsInputSchema.parse(input);

	const result = await searchUsers(auth, {
		query: validatedInput.query,
		role: "CLIENT",
	});

	const clients = Array.isArray(result?.users) ? result.users : [];

	return {
		count: clients.length,

		clients: clients.map((client: any) => ({
			id: client.id,
			name: client.fullName,
			email: client.email,
			companyName: client.companyName || "",
		})),
	};
};
