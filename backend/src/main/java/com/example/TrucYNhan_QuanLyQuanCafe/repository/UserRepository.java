package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
