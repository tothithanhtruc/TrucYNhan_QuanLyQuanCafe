package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.TopicRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.TopicResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<TopicResponse> topics = topicService.getAll();
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách chủ đề thành công",
                "data", topics
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        TopicResponse topic = topicService.getById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin chủ đề thành công",
                "data", topic
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody TopicRequest request) {
        TopicResponse created = topicService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Thêm chủ đề thành công",
                "data", created
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody TopicRequest request) {
        TopicResponse updated = topicService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật chủ đề thành công",
                "data", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        topicService.delete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Xóa chủ đề thành công"
        ));
    }
}
