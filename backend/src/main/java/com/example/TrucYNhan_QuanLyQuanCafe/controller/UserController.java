
package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.User;
import com.example.TrucYNhan_QuanLyQuanCafe.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Lấy danh sách người dùng
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Lấy danh sách người dùng thành công",
                    "data", users));
        } catch (Exception e) {
            return errorResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lấy danh sách người dùng thất bại");
        }
    }

    // Lấy người dùng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Tìm thấy người dùng",
                    "data", user));
        } catch (RuntimeException e) {
            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy người dùng với ID: " + id);
        } catch (Exception e) {
            return errorResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lấy thông tin người dùng thất bại");
        }
    }

    // Thêm người dùng
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User newUser = userService.createUser(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "success", true,
                            "message", "Thêm người dùng thành công",
                            "data", newUser));
        } catch (Exception e) {
            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    "Thêm người dùng thất bại. Vui lòng kiểm tra dữ liệu");
        }
    }

    // Cập nhật người dùng
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody User user) {
        try {
            User updatedUser = userService.updateUser(id, user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Cập nhật người dùng thành công",
                    "data", updatedUser));
        } catch (RuntimeException e) {
            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy người dùng với ID: " + id);
        } catch (Exception e) {
            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    "Cập nhật người dùng thất bại");
        }
    }

    // Xóa người dùng
    // @DeleteMapping("/{id}")
    // public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    //     try {
    //         userService.deleteUser(id);

    //         return ResponseEntity.ok(Map.of(
    //                 "success", true,
    //                 "message", "Xóa người dùng thành công"));
    //     } catch (RuntimeException e) {
    //         return errorResponse(
    //                 HttpStatus.NOT_FOUND,
    //                 "Không tìm thấy người dùng với ID: " + id);
    //     } catch (Exception e) {
    //         return errorResponse(
    //                 HttpStatus.INTERNAL_SERVER_ERROR,
    //                 "Xóa người dùng thất bại");
    //     }
    // }

    // Xóa mềm
    @PutMapping("/{id}/soft-delete")
    public ResponseEntity<?> softDeleteUser(@PathVariable Long id) {
        try {
            userService.softDeleteUser(id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Xóa mềm người dùng thành công"));
        } catch (RuntimeException e) {
            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy người dùng với ID: " + id);
        }
    }

    // Xóa vĩnh viễn
    @DeleteMapping("/{id}/force-delete")
    public ResponseEntity<?> forceDeleteUser(@PathVariable Long id) {
        try {
            userService.forceDeleteUser(id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Xóa vĩnh viễn người dùng thành công"));
        } catch (RuntimeException e) {
            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy người dùng với ID: " + id);
        }
    }

    // Hàm trả về thông báo lỗi
    private ResponseEntity<Map<String, Object>> errorResponse(
            HttpStatus status, String message) {

        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);

        return ResponseEntity.status(status).body(body);
    }
    //
    // Khôi phục người dùng
@PutMapping("/{id}/restore")
public ResponseEntity<?> restoreUser(@PathVariable Long id) {
    try {
        userService.restoreUser(id);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Khôi phục người dùng thành công"
        ));

    } catch (RuntimeException e) {
        return errorResponse(
            HttpStatus.BAD_REQUEST,
            e.getMessage()
        );
    } catch (Exception e) {
        return errorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Khôi phục người dùng thất bại"
        );
    }
}
}
