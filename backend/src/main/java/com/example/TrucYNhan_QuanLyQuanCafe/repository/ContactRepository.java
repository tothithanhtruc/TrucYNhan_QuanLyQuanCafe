
package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    List<Contact> findAllByDeletedAtIsNotNullOrderByDeletedAtDesc();

    List<Contact> findAllByUserIdAndDeletedAtIsNullAndAdminReplyIsNotNullOrderByCreatedAtDesc(Long userId);
}
