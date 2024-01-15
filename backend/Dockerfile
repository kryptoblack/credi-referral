# Description: This file is used to build the docker image for the application
# 
# The image is built in multiple stages to minimize the size of the final image
# 1. The base stage sets up PNPM and copies the entire codebase to the image
# 2. The prod-deps stage installs only the production dependencies
# 3. The build stage builds the application
FROM node:20-slim AS base

# Sets up PNPM and enables corepace to enable PNPM tooling
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copies the entire codebase to the image
COPY . /app
WORKDIR /app

# This stage installs only the production dependencies
# The cache is mounted to the image to speed up the build stage
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# This stage builds the application
# It utilizes the production dependencies from the previous stage and just 
# installs the development dependencies
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# This stage is the final image that is used to run the application
FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 8000
CMD [ "pnpm", "start" ]
