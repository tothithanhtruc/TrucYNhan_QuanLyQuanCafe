
package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.RegisterRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.UserResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.User;
import com.example.TrucYNhan_QuanLyQuanCafe.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
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

    private UserResponse toResponse(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    // Đăng ký người dùng mới (No Auth)
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User newUser = userService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "success", true,
                            "message", "Đăng ký người dùng thành công",
                            "data", toResponse(newUser)
                    )
            );
        } catch (RuntimeException e) {
            return errorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Đăng ký thất bại");
        }
    }

    // Đăng xuất (xóa SecurityContext và hủy session)
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đăng xuất thành công"
        ));
    }

    // Lấy danh sách người dùng
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserResponse> users = userService.getAllUsers()
                    .stream()
                    .map(this::toResponse)
                    .toList();

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
