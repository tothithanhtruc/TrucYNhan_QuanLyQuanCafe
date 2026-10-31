
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

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Contact c WHERE (c.user.id = :userId OR (c.email IS NOT NULL AND LOWER(c.email) = LOWER(:email))) AND c.deletedAt IS NULL ORDER BY c.createdAt DESC")
    List<Contact> findUserInboxContacts(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("email") String email);
}
