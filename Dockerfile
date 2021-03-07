FROM node:15-alpine AS base
WORKDIR /app
EXPOSE 80

FROM node:15-alpine AS dependencies
WORKDIR /src
COPY ["package.json", "."]
COPY ["yarn.lock", "."]
RUN yarn

FROM dependencies AS build
WORKDIR /src
COPY . .
RUN yarn build

FROM base AS final
WORKDIR /app
COPY --from=build /src/package.json .
COPY --from=build /src/node_modules node_modules
COPY --from=build /src/dist dist
ENV SERVER_PORT=80
ENTRYPOINT [ "yarn", "start" ]
