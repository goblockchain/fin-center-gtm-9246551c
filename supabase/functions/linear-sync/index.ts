// Linear read-only sync: fetches projects + issues from a specific team.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/linear/graphql";

async function linearQuery(query: string, variables: Record<string, unknown> = {}) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const LINEAR_API_KEY = Deno.env.get("LINEAR_API_KEY");
  if (!LOVABLE_API_KEY || !LINEAR_API_KEY) {
    throw new Error("Missing LOVABLE_API_KEY or LINEAR_API_KEY");
  }
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": LINEAR_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Linear gateway ${res.status}: ${text}`);
  }
  const json = JSON.parse(text);
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const teamName = url.searchParams.get("team") ?? "Sprint - View";

    // Find team by name (case-insensitive contains)
    const teamsData = await linearQuery(`
      query { teams(first: 100) { nodes { id name key } } }
    `);
    const teams: Array<{ id: string; name: string; key: string }> = teamsData.teams.nodes;
    const team =
      teams.find((t) => t.name.toLowerCase() === teamName.toLowerCase()) ??
      teams.find((t) => t.name.toLowerCase().includes(teamName.toLowerCase()));

    if (!team) {
      return new Response(
        JSON.stringify({
          error: `Team "${teamName}" not found`,
          available_teams: teams.map((t) => t.name),
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Projects for this team
    const projectsData = await linearQuery(
      `query($teamId: String!) {
        team(id: $teamId) {
          projects(first: 100) {
            nodes {
              id name description state progress startDate targetDate
              url color icon
              lead { name }
            }
          }
        }
      }`,
      { teamId: team.id },
    );

    // Issues for this team (open + recently closed)
    const issuesData = await linearQuery(
      `query($teamId: ID!) {
        issues(
          first: 100,
          filter: { team: { id: { eq: $teamId } } },
          orderBy: updatedAt
        ) {
          nodes {
            id identifier title priority priorityLabel
            estimate dueDate url
            state { name type color }
            assignee { name }
            project { id name }
            updatedAt
          }
        }
      }`,
      { teamId: team.id },
    );

    return new Response(
      JSON.stringify({
        team,
        projects: projectsData.team.projects.nodes,
        issues: issuesData.issues.nodes,
        synced_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("linear-sync error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
