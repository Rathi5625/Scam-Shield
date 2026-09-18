package com.scamshield.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@ConfigurationProperties(prefix = "storage.local")
public class LocalStorageProperties {

    private String baseDir = Paths.get(System.getProperty("java.io.tmpdir"), "scamshield-storage").toString();
    private long maxSizeBytes = 5 * 1024 * 1024; // 5MB limit
    private int retentionHours = 24;

    public LocalStorageProperties() {}

    public String getBaseDir() {
        return baseDir;
    }

    public void setBaseDir(String baseDir) {
        this.baseDir = baseDir;
    }

    public long getMaxSizeBytes() {
        return maxSizeBytes;
    }

    public void setMaxSizeBytes(long maxSizeBytes) {
        this.maxSizeBytes = maxSizeBytes;
    }

    public int getRetentionHours() {
        return retentionHours;
    }

    public void setRetentionHours(int retentionHours) {
        this.retentionHours = retentionHours;
    }
}
