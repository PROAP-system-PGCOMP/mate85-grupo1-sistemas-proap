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

COPY --from=frontend-build /workspace/front/dist /workspace/back/src/main/resources/static

RUN ./mvnw -B clean package -DskipTests

########################################
# Stage 3 – runtime (Apenas JRE)       #
########################################
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=backend-build /workspace/back/target/*.jar app.jar

# Configurações de porta
ENV SERVER_PORT=5000
EXPOSE 5000

ENTRYPOINT ["java", "-jar", "app.jar"]