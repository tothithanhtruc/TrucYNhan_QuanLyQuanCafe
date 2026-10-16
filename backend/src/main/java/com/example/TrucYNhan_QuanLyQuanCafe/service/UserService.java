
package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.User;
import java.util.List;

public interface UserService {
    List<User> getAllUsers();

    User getUserById(Long id);

    User createUser(User user);

    User updateUser(Long id, User user);

    // void deleteUser(Long id); //

    void softDeleteUser(Long id); // xóa mềm

    void forceDeleteUser(Long id); /// xóa vĩnh viễn

    void restoreUser(Long id); //khôi phục
}
