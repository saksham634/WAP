# =============================================================================
# Stage 1: Build the application using Maven
# =============================================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the executable JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# =============================================================================
# Stage 2: Lightweight Production Runtime
# =============================================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Add non-root user for enhanced security
RUN addgroup -S wapgroup && adduser -S wapuser -G wapgroup

# Install curl for container health checks
RUN apk add --no-cache curl

# Copy compiled JAR from builder stage
COPY --from=builder /app/target/WAP-Backend-0.0.1-SNAPSHOT.jar app.jar

# Change file ownership to non-root user
RUN chown -R wapuser:wapgroup /app
USER wapuser

# Expose Spring Boot port
EXPOSE 8080

# Configure JVM memory limits for container environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:8080/v3/api-docs || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
