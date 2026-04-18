########################################
# Stage 1 – build do front (Vite)      #
########################################
FROM node:22-alpine AS frontend-build
WORKDIR /workspace/front
COPY proap-web/package*.json ./
RUN npm ci
COPY proap-web/ .
RUN npm run build

########################################
# Stage 2 – build do back (Spring)     #
########################################
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /workspace/back
COPY proap-api/pom.xml proap-api/mvnw ./
COPY proap-api/.mvn .mvn
RUN ./mvnw -B dependency:go-offline
COPY proap-api/src src
RUN ./mvnw -B clean package -DskipTests

########################################
# Stage 3 – runtime (Nginx + JRE)      #
########################################
FROM eclipse-temurin:21-jre-alpine
# 1) dependências mínimas via Alpine
RUN apk add --no-cache nginx ca-certificates gettext

# 2) artefatos
WORKDIR /app
COPY --from=frontend-build /workspace/front/dist /usr/share/nginx/html
COPY --from=backend-build /workspace/back/target/*.jar app.jar
COPY deploy/nginx.conf /etc/nginx/templates/default.conf.template
COPY deploy/start.sh /start.sh

# 4) portas e entrypoint
ENV API_PORT=5000
EXPOSE 5000
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]