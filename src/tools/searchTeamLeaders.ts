import { z } from "zod";

import type { ApiKeyAuthContext } from "../auth/apiKey.js";
import { searchUsers } from "../services/klikbaseApi.js";

export const searchTeamLeadersInputSchema = z.object({
	query: z
		.string()
		.trim()
		.min(1, "Search query is required.")
		.describe("Team Leader name, email, or company name to search for in Klikbase."),
});

export type SearchTeamLeadersInput = z.infer<typeof searchTeamLeadersInputSchema>;

export const searchTeamLeaders = async (input: SearchTeamLeadersInput, auth: ApiKeyAuthContext) => {
	const validatedInput = searchTeamLeadersInputSchema.parse(input);

	const result = await searchUsers(auth, {
		query: validatedInput.query,
		role: "TEAM_LEADER",
	});

	const teamLeaders = Array.isArray(result?.users) ? result.users : [];

	return {
		count: teamLeaders.length,

		teamLeaders: teamLeaders.map((teamLeader: any) => ({
			id: teamLeader.id,
			name: teamLeader.fullName,
			email: teamLeader.email,
			companyName: teamLeader.companyName || "",
		})),
	};
};
