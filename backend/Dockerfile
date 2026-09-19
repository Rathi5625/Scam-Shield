# ============================================================
# Stage 1: Build Spring Boot Application
# ============================================================
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package executable JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================================
# Stage 2: Production Runtime Environment
# ============================================================
FROM eclipse-temurin:21-jre-jammy AS runtime

# Security: Create non-root system user and group
RUN groupadd --system --gid 10001 scamshield && \
    useradd --system --uid 10001 --gid scamshield --create-home --home-dir /app scamshield

WORKDIR /app

# Copy compiled JAR from builder stage
COPY --from=builder --chown=scamshield:scamshield /build/target/*.jar app.jar

# Enforce non-root execution
USER scamshield:scamshield

# Expose backend service port
EXPOSE 8080

# Environment defaults (can be overridden at container runtime)
ENV SERVER_PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Healthcheck definition for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Launch Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
