package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
}

