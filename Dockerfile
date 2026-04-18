########################################
# Stage 1 – build do front (Vite)
########################################
FROM node:22-alpine AS frontend-build
WORKDIR /workspace/front
COPY proap-web/package*.json ./
RUN npm ci
COPY proap-web/ .
RUN npm run build

########################################
# Stage 2 – build do back (Spring)
########################################
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /workspace/back

# 1. Copia o Maven
COPY proap-api/pom.xml proap-api/mvnw ./
COPY proap-api/.mvn .mvn
RUN ./mvnw -B dependency:go-offline

# 2. Copia o código do Java
COPY proap-api/src src

RUN mkdir -p src/main/resources/static
COPY --from=frontend-build /workspace/front/dist/ src/main/resources/static/

# 4. Gera o JAR com tudo dentro
RUN ./mvnw -B clean package -DskipTests

########################################
# Stage 3 – runtime (SÓ JAVA)
########################################
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=backend-build /workspace/back/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx512m", "-Dserver.port=${PORT}", "-jar", "app.jar"]