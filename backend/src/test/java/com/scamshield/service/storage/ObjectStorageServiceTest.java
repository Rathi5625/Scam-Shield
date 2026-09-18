package com.scamshield.service.storage;

import com.scamshield.config.LocalStorageProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ServerSideEncryption;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ObjectStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalObjectStorageService localService;

    @BeforeEach
    void setUp() {
        LocalStorageProperties props = new LocalStorageProperties();
        props.setBaseDir(tempDir.toString());
        props.setMaxSizeBytes(5 * 1024 * 1024);
        localService = new LocalObjectStorageService(props);
    }

    private static final byte[] VALID_PNG = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3, 4};
    private static final byte[] VALID_JPEG = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 1, 2, 3, 4, 5, 6, 7, 8};
    private static final byte[] VALID_WEBP = new byte[]{'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'};

    @Test
    void testLocalStoreAndRetrieveValidImage() throws Exception {
        byte[] imageBytes = VALID_PNG;

        ObjectStorageService.StoredObject stored = localService.storeObject(
                "cognito-user-456",
                imageBytes,
                "image/png",
                false
        );

        assertThat(stored).isNotNull();
        assertThat(stored.objectKey()).startsWith("private/cognito-user-456/");
        assertThat(stored.objectKey()).endsWith(".png");
        assertThat(stored.mimeType()).isEqualTo("image/png");
        assertThat(stored.sizeBytes()).isEqualTo(imageBytes.length);
        assertThat(stored.storageMode()).isEqualTo("LOCAL");

        // Verify metadata retrieval
        Optional<ObjectStorageService.StoredObjectMetadata> meta = localService.getMetadata(stored.objectKey());
        assertThat(meta).isPresent();
        assertThat(meta.get().objectKey()).isEqualTo(stored.objectKey());
        assertThat(meta.get().mimeType()).isEqualTo("image/png");
        assertThat(meta.get().sizeBytes()).isEqualTo(imageBytes.length);

        // Verify underlying file
        Path filePath = tempDir.resolve(stored.objectKey());
        assertThat(Files.exists(filePath)).isTrue();
        assertThat(Files.readAllBytes(filePath)).isEqualTo(imageBytes);
    }

    @Test
    void testLocalStoreRejectsDisallowedMimeType() {
        byte[] payload = "console.log('malicious');".getBytes(StandardCharsets.UTF_8);

        assertThatThrownBy(() -> localService.storeObject(
                "user-1",
                payload,
                "application/javascript",
                false
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("Unsupported media type");
    }

    @Test
    void testLocalStoreRejectsPayloadOver5MB() {
        byte[] oversized = new byte[6 * 1024 * 1024];

        assertThatThrownBy(() -> localService.storeObject(
                "user-1",
                oversized,
                "image/png",
                false
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("exceeds maximum 5MB limit");
    }

    @Test
    void testLocalPathTraversalPrevention() {
        assertThatThrownBy(() -> localService.resolveSafePath("../../../etc/passwd"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Path traversal attempt");

        assertThatThrownBy(() -> localService.resolveSafePath("..\\..\\secret.key"))
                .isInstanceOf(SecurityException.class);

        assertThat(localService.getMetadata("../../../etc/passwd")).isEmpty();
        assertThat(localService.generateAccessUrl("../../../etc/passwd", Duration.ofMinutes(5))).isEmpty();
    }

    @Test
    void testLocalDeleteObject() {
        byte[] data = VALID_JPEG;
        ObjectStorageService.StoredObject stored = localService.storeObject(
                "user-2",
                data,
                "image/jpeg",
                true
        );

        assertThat(localService.getMetadata(stored.objectKey())).isPresent();

        boolean deleted = localService.deleteObject(stored.objectKey());
        assertThat(deleted).isTrue();

        assertThat(localService.getMetadata(stored.objectKey())).isEmpty();
    }

    @Test
    void testLocalAccessUrlGeneration() {
        byte[] data = VALID_WEBP;
        ObjectStorageService.StoredObject stored = localService.storeObject(
                "user-3",
                data,
                "image/webp",
                false
        );

        Optional<String> url = localService.generateAccessUrl(stored.objectKey(), Duration.ofMinutes(10));
        assertThat(url).isPresent();
        assertThat(url.get()).contains("/api/storage/local?key=" + stored.objectKey());
    }

    @Test
    void testMagicBytesMismatchRejection() {
        // Disguised HTML/JS pretending to be PNG
        byte[] maliciousHtml = "<html><script>alert('pwn')</script></html>".getBytes(StandardCharsets.UTF_8);

        assertThatThrownBy(() -> localService.storeObject(
                "user-attacker",
                maliciousHtml,
                "image/png",
                false
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("File content signature does not match declared MIME type");
    }

    @Test
    void testS3ServiceEnforcesServerSideEncryptionAndClampsDuration() throws Exception {
        S3Client mockS3 = mock(S3Client.class);
        S3Presigner mockPresigner = mock(S3Presigner.class);

        S3ObjectStorageService s3Service = new S3ObjectStorageService(
                mockS3,
                mockPresigner,
                "scamshield-evidence-test-bucket"
        );

        byte[] data = VALID_PNG;

        ObjectStorageService.StoredObject stored = s3Service.storeObject(
                "sub-789",
                data,
                "image/png",
                false
        );

        assertThat(stored.objectKey()).startsWith("private/sub-789/");
        assertThat(stored.objectKey()).endsWith(".png");
        assertThat(stored.storageMode()).isEqualTo("S3");

        // Verify S3Client PutObjectRequest used AES256 server side encryption
        org.mockito.ArgumentCaptor<PutObjectRequest> putCaptor = org.mockito.ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(mockS3).putObject(putCaptor.capture(), any(RequestBody.class));
        PutObjectRequest putReq = putCaptor.getValue();
        assertThat(putReq.bucket()).isEqualTo("scamshield-evidence-test-bucket");
        assertThat(putReq.serverSideEncryption()).isEqualTo(ServerSideEncryption.AES256);
        assertThat(putReq.contentType()).isEqualTo("image/png");

        // Test presigned URL generation clamping
        PresignedGetObjectRequest presignedResponse = mock(PresignedGetObjectRequest.class);
        when(presignedResponse.url()).thenReturn(URI.create("https://scamshield-evidence-test-bucket.s3.ap-south-1.amazonaws.com/test?X-Amz-Expires=900").toURL());
        when(mockPresigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presignedResponse);

        // Asking for 2 hours (should clamp to 15 min / 900s max)
        Optional<String> url = s3Service.generateAccessUrl(stored.objectKey(), Duration.ofHours(2));
        assertThat(url).isPresent();
        assertThat(url.get()).contains("scamshield-evidence-test-bucket");

        org.mockito.ArgumentCaptor<GetObjectPresignRequest> presignCaptor = org.mockito.ArgumentCaptor.forClass(GetObjectPresignRequest.class);
        verify(mockPresigner).presignGetObject(presignCaptor.capture());
        assertThat(presignCaptor.getValue().signatureDuration()).isEqualTo(Duration.ofSeconds(900));
    }
}
