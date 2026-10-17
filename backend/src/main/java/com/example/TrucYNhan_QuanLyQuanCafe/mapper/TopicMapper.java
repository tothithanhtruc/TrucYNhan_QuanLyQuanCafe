package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.TopicRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.TopicResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Topic;
import org.springframework.stereotype.Component;

@Component
public class TopicMapper {

    public Topic toEntity(TopicRequest request) {
        if (request == null) return null;

        Topic topic = new Topic();
        topic.setName(request.name());
        topic.setAlias(request.alias());
        topic.setDescription(request.description());
        topic.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
        topic.setStatus(request.status() != null ? request.status() : 1);
        return topic;
    }

    public TopicResponse toResponse(Topic topic) {
        if (topic == null) return null;

        return new TopicResponse(
                topic.getId(),
                topic.getName(),
                topic.getAlias(),
                topic.getDescription(),
                topic.getSortOrder(),
                topic.getStatus(),
                topic.getCreatedAt(),
                topic.getUpdatedAt()
        );
    }
}
