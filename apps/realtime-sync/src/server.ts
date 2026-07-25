import { Hocuspocus } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import { pool } from "./db";
import { authenticateConnection } from "./auth";

const port = Number(process.env.PORT ?? 1234);

const server = new Hocuspocus({
  port,
  extensions: [
    new Database({
      fetch: async ({ documentName }) => {
        const result = await pool.query<{ state: Buffer }>(
          "select state from yjs_documents where doc_name = $1",
          [documentName]
        );
        return result.rows[0]?.state ?? null;
      },
      store: async ({ documentName, state }) => {
        const [docType, id] = documentName.split(":");
        const table = docType === "entry" ? "world_builder_entries" : "maps";

        const projectResult = await pool.query<{ project_id: string }>(
          `select project_id from ${table} where id = $1`,
          [id]
        );
        const projectId = projectResult.rows[0]?.project_id;
        if (!projectId) return;

        await pool.query(
          `insert into yjs_documents (doc_name, doc_type, project_id, state, updated_at)
           values ($1, $2, $3, $4, now())
           on conflict (doc_name) do update set state = excluded.state, updated_at = now()`,
          [documentName, docType, projectId, state]
        );
      },
    }),
  ],

  async onAuthenticate({ token, documentName, connection }) {
    const { userId, readOnly } = await authenticateConnection(token, documentName);
    connection.readOnly = readOnly;
    return { userId };
  },
});

server.listen().then(() => {
  console.log(`ArcanaVTT realtime-sync listening on port ${port}`);
});

process.on("SIGTERM", async () => {
  await server.destroy();
  await pool.end();
  process.exit(0);
});
