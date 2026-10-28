package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactReplyRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<ContactResponse> contacts = contactService.getAll();
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách liên hệ thành công",
                "data", contacts
        ));
    }

    @GetMapping("/trash")
    public ResponseEntity<Map<String, Object>> getTrash() {
        List<ContactResponse> contacts = contactService.getTrash();
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách liên hệ trong thùng rác thành công",
                "data", contacts
        ));
    }

    @GetMapping("/inbox")
    public ResponseEntity<Map<String, Object>> getInbox(Authentication authentication) {
        List<ContactResponse> contacts = contactService.getInbox(authentication.getName());
        return ResponseEntity.ok(Map.of(
                "message", "Lấy hộp thư liên hệ thành công",
                "data", contacts
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        ContactResponse contact = contactService.getById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin liên hệ thành công",
                "data", contact
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @Valid @RequestBody ContactRequest request,
            Authentication authentication) {
        String username = authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName())
                ? authentication.getName()
                : null;
        ContactResponse created = contactService.create(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Gửi liên hệ thành công",
                "data", created
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody ContactRequest request) {
        ContactResponse updated = contactService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật liên hệ thành công",
                "data", updated
        ));
    }

    @PutMapping("/{id}/reply")
    public ResponseEntity<Map<String, Object>> reply(
            @PathVariable Long id,
            @Valid @RequestBody ContactReplyRequest request) {
        ContactResponse updated = contactService.reply(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Lưu phản hồi thành công",
                "data", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Đã chuyển liên hệ vào thùng rác"
        ));
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<Map<String, Object>> restore(@PathVariable Long id) {
        contactService.restore(id);
        return ResponseEntity.ok(Map.of(
                "message", "Khôi phục liên hệ thành công"
        ));
    }

    @DeleteMapping("/{id}/force-delete")
    public ResponseEntity<Map<String, Object>> forceDelete(@PathVariable Long id) {
        contactService.forceDelete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Xóa vĩnh viễn liên hệ thành công"
        ));
    }
}
