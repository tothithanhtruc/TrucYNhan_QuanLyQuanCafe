
package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.User;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.UserRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
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
    public User createUser(User user) {
        LocalDateTime now = LocalDateTime.now();
        user.setId(null);
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
