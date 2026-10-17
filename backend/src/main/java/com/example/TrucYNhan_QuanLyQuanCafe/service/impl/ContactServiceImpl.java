package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Contact;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.ContactMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.ContactRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.ContactService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;

    public ContactServiceImpl(ContactRepository contactRepository, ContactMapper contactMapper) {
        this.contactRepository = contactRepository;
        this.contactMapper = contactMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactResponse> getAll() {
        return contactRepository.findAll()
                .stream()
                .map(contactMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ContactResponse getById(Long id) {
        return contactRepository.findById(id)
                .map(contactMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy liên hệ với id: " + id));
    }

    @Override
    public ContactResponse create(ContactRequest request) {
        Contact contact = contactMapper.toEntity(request);
        return contactMapper.toResponse(contactRepository.save(contact));
    }

    @Override
    public ContactResponse update(Long id, ContactRequest request) {
        Contact existing = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy liên hệ với id: " + id));

        existing.setName(request.name());
        existing.setEmail(request.email());
        existing.setPhone(request.phone());
        existing.setSubject(request.subject());
        existing.setMessage(request.message());
        if (request.status() != null) {
            existing.setStatus(request.status());
        }

        return contactMapper.toResponse(contactRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!contactRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy liên hệ với id: " + id);
        }
        contactRepository.deleteById(id);
    }
}
