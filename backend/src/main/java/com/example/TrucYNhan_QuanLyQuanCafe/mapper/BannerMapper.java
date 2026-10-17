package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.BannerRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.BannerResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Banner;
import org.springframework.stereotype.Component;

@Component
public class BannerMapper {

    public Banner toEntity(BannerRequest request) {
        if (request == null) {
            return null;
        }

        Banner banner = new Banner();
        banner.setName(request.name());
        banner.setImage(request.image());
        banner.setLink(request.link());
        banner.setPosition(request.position());
        banner.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
        banner.setStartDate(request.startDate());
        banner.setEndDate(request.endDate());
        banner.setStatus(request.status() != null ? request.status() : 1);

        return banner;
    }

    public BannerResponse toResponse(Banner banner) {
        if (banner == null) {
            return null;
        }

        return new BannerResponse(
                banner.getId(),
                banner.getName(),
                banner.getImage(),
                banner.getLink(),
                banner.getPosition(),
                banner.getSortOrder(),
                banner.getStartDate(),
                banner.getEndDate(),
                banner.getStatus(),
                banner.getCreatedAt(),
                banner.getUpdatedAt()
        );
    }
}
