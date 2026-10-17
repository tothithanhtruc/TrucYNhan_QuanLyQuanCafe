
package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
}
