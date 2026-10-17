package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PostResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Post;
import org.springframework.stereotype.Component;

@Component
public class PostMapper {

    public PostResponse toResponse(Post post) {
        if (post == null) return null;

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getAlias(),
                post.getSummary(),
                post.getContent(),
                post.getThumbnail(),
                post.getTopic() != null ? post.getTopic().getId() : null,
                post.getTopic() != null ? post.getTopic().getName() : null,
                post.getUser() != null ? post.getUser().getId() : null,
                post.getUser() != null ? post.getUser().getUsername() : null,
                post.getStatus(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getDeletedAt()
        );
    }
}
