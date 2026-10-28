package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByDeletedAtIsNullOrderByCreatedAtDescIdDesc();
    List<Post> findByDeletedAtIsNotNullOrderByDeletedAtDesc();
    List<Post> findByTopicId(Long topicId);
    List<Post> findByUserId(Long userId);
    List<Post> findByStatus(Integer status);
}
