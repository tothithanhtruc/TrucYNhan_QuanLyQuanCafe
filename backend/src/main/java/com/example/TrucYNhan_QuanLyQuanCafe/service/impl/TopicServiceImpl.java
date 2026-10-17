package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.TopicRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.TopicResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Topic;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.TopicMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.TopicRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.TopicService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;
    private final TopicMapper topicMapper;

    public TopicServiceImpl(TopicRepository topicRepository, TopicMapper topicMapper) {
        this.topicRepository = topicRepository;
        this.topicMapper = topicMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicResponse> getAll() {
        return topicRepository.findAll()
                .stream()
                .map(topicMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TopicResponse getById(Long id) {
        return topicRepository.findById(id)
                .map(topicMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ đề với id: " + id));
    }

    @Override
    public TopicResponse create(TopicRequest request) {
        Topic topic = topicMapper.toEntity(request);
        return topicMapper.toResponse(topicRepository.save(topic));
    }

    @Override
    public TopicResponse update(Long id, TopicRequest request) {
        Topic existing = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ đề với id: " + id));

        existing.setName(request.name());
        existing.setAlias(request.alias());
        existing.setDescription(request.description());
        if (request.sortOrder() != null) existing.setSortOrder(request.sortOrder());
        if (request.status() != null) existing.setStatus(request.status());

        return topicMapper.toResponse(topicRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!topicRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy chủ đề với id: " + id);
        }
        topicRepository.deleteById(id);
    }
}
