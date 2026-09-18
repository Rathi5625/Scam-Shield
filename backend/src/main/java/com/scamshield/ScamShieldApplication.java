package com.scamshield;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class ScamShieldApplication {

    public static void main(String[] args) {
        loadDotenvIfPresent();
        SpringApplication.run(ScamShieldApplication.class, args);
    }

    /**
     * Inspects the local working directory and parent paths for a local .env file.
     * Sets parsed entries into System properties so Spring Boot can resolve them,
     * without overriding active environment variables or logging sensitive secrets.
     */
    private static void loadDotenvIfPresent() {
        List<Path> potentialPaths = List.of(
                Paths.get(".env"),
                Paths.get("backend", ".env"),
                Paths.get("..", ".env")
        );

        for (Path path : potentialPaths) {
            if (Files.exists(path) && Files.isRegularFile(path)) {
                try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String val = line.substring(eqIdx + 1).trim();
                            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                                if (val.length() >= 2) {
                                    val = val.substring(1, val.length() - 1);
                                }
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                    break;
                } catch (Exception ignored) {
                    // Non-blocking: fallback to standard environment variable resolution
                }
            }
        }
    }
}
