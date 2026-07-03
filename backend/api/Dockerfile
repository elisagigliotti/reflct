# Multi-stage build: compila con Maven+JDK21, esegue con solo JRE21 (immagine finale piu' leggera).
# NOTA: non testato in questo ambiente (ne' Maven ne' Docker sono disponibili qui, vedi README).

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /build/target/reflct-api.jar ./reflct-api.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "reflct-api.jar"]
