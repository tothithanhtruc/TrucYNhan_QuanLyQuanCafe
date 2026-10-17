package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PostRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.PostResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Post;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Topic;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.User;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.BadRequestException;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.PostMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.PostRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.TopicRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.UserRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.PostService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final PostMapper postMapper;

    public PostServiceImpl(PostRepository postRepository,
                           TopicRepository topicRepository,
                           UserRepository userRepository,
                           PostMapper postMapper) {
        this.postRepository = postRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
        this.postMapper = postMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getAll() {
        return postRepository.findAll().stream()
                .map(postMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getById(Long id) {
        return postRepository.findById(id)
                .map(postMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id));
    }

    @Override
    public PostResponse create(PostRequest request) {
        Post post = new Post();
        applyRequest(post, request);
        return postMapper.toResponse(postRepository.save(post));
    }

    @Override
    public PostResponse update(Long id, PostRequest request) {
        Post existing = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id));
        applyRequest(existing, request);
        return postMapper.toResponse(postRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!postRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id);
        }
        postRepository.deleteById(id);
    }

    @Override
    public void softDelete(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id));
        post.setDeletedAt(LocalDateTime.now());
        postRepository.save(post);
    }

    @Override
    public void restore(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id));
        if (post.getDeletedAt() == null) {
            throw new BadRequestException("Bài viết chưa bị xóa mềm");
        }
        post.setDeletedAt(null);
        postRepository.save(post);
    }

    private void applyRequest(Post post, PostRequest request) {
        post.setTitle(request.title());
        post.setAlias(request.alias());
        post.setSummary(request.summary());
        post.setContent(request.content());
        post.setThumbnail(request.thumbnail());
        if (request.status() != null) post.setStatus(request.status());

        if (request.topicId() != null) {
            Topic topic = topicRepository.findById(request.topicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ đề với id: " + request.topicId()));
            post.setTopic(topic);
        }
        if (request.userId() != null) {
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + request.userId()));
            post.setUser(user);
        }
    }
}
