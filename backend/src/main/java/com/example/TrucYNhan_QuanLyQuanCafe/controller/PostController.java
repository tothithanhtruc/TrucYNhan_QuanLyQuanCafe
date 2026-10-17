package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PostRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.PostResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<PostResponse> posts = postService.getAll();
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách bài viết thành công",
                "data", posts
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        PostResponse post = postService.getById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin bài viết thành công",
                "data", post
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody PostRequest request) {
        PostResponse created = postService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Thêm bài viết thành công",
                "data", created
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {
        PostResponse updated = postService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật bài viết thành công",
                "data", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Xóa bài viết thành công"
        ));
    }

    @PutMapping("/{id}/soft-delete")
    public ResponseEntity<Map<String, Object>> softDelete(@PathVariable Long id) {
        postService.softDelete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Xóa mềm bài viết thành công"
        ));
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<Map<String, Object>> restore(@PathVariable Long id) {
        postService.restore(id);
        return ResponseEntity.ok(Map.of(
                "message", "Khôi phục bài viết thành công"
        ));
    }
}
