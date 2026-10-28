
package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.RegisterRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.User;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.UserRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng ID: " + id));
    }

    @Override
    public User register(RegisterRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại: " + request.username());
        }

        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("USER");
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setStatus(1);

        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        return userRepository.save(user);
    }

    @Override
    public User createUser(User user) {
        LocalDateTime now = LocalDateTime.now();
        user.setId(null);
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$") && !user.getPassword().startsWith("$2b$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User user) {
        User existing = getUserById(id);

        existing.setUsername(user.getUsername());
        existing.setPassword(user.getPassword());
        existing.setFullName(user.getFullName());
        existing.setEmail(user.getEmail());
        existing.setPhone(user.getPhone());
        existing.setRole(user.getRole());
        existing.setImage(user.getImage());
        existing.setStatus(user.getStatus());
        existing.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(existing);
    }

    // @Override
    // public void deleteUser(Long id) {
    //     User user = getUserById(id);
    //     userRepository.delete(user);
    // }

    @Override
    public void softDeleteUser(Long id) {
        User user = getUserById(id);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    public void forceDeleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    @Override
    public void restoreUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy người dùng ID: " + id));

        if (user.getDeletedAt() == null) {
            throw new RuntimeException(
                    "Người dùng chưa bị xóa mềm");
        }

        user.setDeletedAt(null);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }
}
