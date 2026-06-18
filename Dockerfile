FROM node:22-alpine
RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN --mount=type=secret,id=envprod,target=/app/.env.prod DOTENV_CONFIG_PATH=.env.prod pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]

