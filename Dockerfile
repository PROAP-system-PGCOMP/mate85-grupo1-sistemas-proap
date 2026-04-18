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
COPY proap-api/pom.xml proap-api/mvnw ./
COPY proap-api/.mvn .mvn
RUN ./mvnw -B dependency:go-offline

# [MUDANÇA AQUI] Copia o build do front para dentro da pasta de recursos estáticos do Spring
COPY --from=frontend-build /workspace/front/dist src/main/resources/static

COPY proap-api/src src
RUN ./mvnw -B clean package -DskipTests

########################################
# Stage 3 – runtime (Apenas JRE)
########################################
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Não instalamos mais o Nginx. Apenas o JAR.
COPY --from=backend-build /workspace/back/target/*.jar app.jar

# O Dokku injeta automaticamente a variável $PORT
EXPOSE 8080

# Rodar a aplicação diretamente.
# O Spring Boot vai servir o index.html na raiz automaticamente.
ENTRYPOINT ["java", "-Xmx512m", "-Dserver.port=${PORT}", "-jar", "app.jar"]