package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.TrucYNhan_QuanLyQuanCafe.exception.BadRequestException;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private static final Path UPLOAD_DIRECTORY = Paths.get("uploads").toAbsolutePath().normalize();

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty() || file.getContentType() == null
                || !file.getContentType().toLowerCase().startsWith("image/")) {
            throw new BadRequestException("Vui lòng chọn một tệp hình ảnh hợp lệ");
        }

        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (extension == null || !extension.matches("(?i)png|jpe?g|gif|webp")) {
            throw new BadRequestException("Chỉ hỗ trợ ảnh PNG, JPG, GIF hoặc WEBP");
        }

        String filename = UUID.randomUUID() + "." + extension.toLowerCase();
        try {
            Files.createDirectories(UPLOAD_DIRECTORY);
            Files.copy(file.getInputStream(), UPLOAD_DIRECTORY.resolve(filename));
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể lưu hình ảnh lên máy chủ", exception);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "url", "/api/uploads/" + filename
        ));
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getImage(@org.springframework.web.bind.annotation.PathVariable String filename)
            throws IOException {
        Path imagePath = UPLOAD_DIRECTORY.resolve(filename).normalize();
        if (!imagePath.startsWith(UPLOAD_DIRECTORY) || !Files.exists(imagePath)) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(imagePath);
        Resource resource = new FileSystemResource(imagePath);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE))
                .body(resource);
    }
}
