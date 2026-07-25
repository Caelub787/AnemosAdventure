FROM node:22-slim AS build
WORKDIR /repo

RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/realtime-sync/package.json apps/realtime-sync/package.json
RUN pnpm install --frozen-lockfile --filter @arcanavtt/realtime-sync

COPY apps/realtime-sync apps/realtime-sync
RUN pnpm --filter @arcanavtt/realtime-sync build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /repo/apps/realtime-sync/dist ./dist
COPY --from=build /repo/apps/realtime-sync/node_modules ./node_modules
COPY --from=build /repo/apps/realtime-sync/package.json ./package.json

EXPOSE 1234
CMD ["node", "dist/server.js"]
