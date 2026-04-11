FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json ./
RUN pnpm -r build

FROM base AS runtime
ARG PACKAGE
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./

WORKDIR /app/packages/${PACKAGE}
USER node
CMD ["node", "dist/index.js"]
