package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactReplyRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Contact;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.ContactMessage;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.ContactMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.ContactRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.UserRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.ContactService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;
    private final UserRepository userRepository;

    public ContactServiceImpl(
            ContactRepository contactRepository,
            ContactMapper contactMapper,
            UserRepository userRepository) {
        this.contactRepository = contactRepository;
        this.contactMapper = contactMapper;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactResponse> getAll() {
        return contactRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(contactMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactResponse> getTrash() {
        return contactRepository.findAllByDeletedAtIsNotNullOrderByDeletedAtDesc()
                .stream()
                .map(contactMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactResponse> getInbox(String username) {
        return userRepository.findByUsername(username)
                .map(user -> {
                    String email = user.getEmail() != null ? user.getEmail().trim() : "";
                    return contactRepository.findUserInboxContacts(user.getId(), email);
                })
                .orElseGet(List::of)
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
    public ContactResponse create(ContactRequest request, String username) {
        Contact contact = contactMapper.toEntity(request);
        if (username != null) {
            userRepository.findByUsername(username).ifPresent(contact::setUser);
        }
        if (contact.getUser() == null && request.email() != null && !request.email().isBlank()) {
            userRepository.findFirstByEmailIgnoreCase(request.email().trim()).ifPresent(contact::setUser);
        }
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
    public ContactResponse reply(Long id, ContactReplyRequest request) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy liên hệ với id: " + id));
        if (contact.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Không thể phản hồi liên hệ đang ở trong thùng rác: " + id);
        }
        String reply = request.reply().trim();
        contact.setAdminReply(reply);
        if (contact.getUser() == null && contact.getEmail() != null && !contact.getEmail().isBlank()) {
            userRepository.findFirstByEmailIgnoreCase(contact.getEmail().trim()).ifPresent(contact::setUser);
        }
        addMessage(contact, "ADMIN", reply);
        return contactMapper.toResponse(contactRepository.save(contact));
    }

    @Override
    public ContactResponse sendMessage(Long id, ContactReplyRequest request, String username, boolean admin) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy liên hệ với id: " + id));
        if (contact.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Không thể nhắn tin trong liên hệ đang ở trong thùng rác: " + id);
        }

        String senderRole = admin ? "ADMIN" : "USER";
        if (!admin) {
            var user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản đang đăng nhập"));
            boolean ownsContact = contact.getUser() != null
                    && contact.getUser().getId().equals(user.getId());
            boolean matchesEmail = contact.getEmail() != null
                    && user.getEmail() != null
                    && contact.getEmail().trim().equalsIgnoreCase(user.getEmail().trim());
            if (!ownsContact && !matchesEmail) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Bạn không có quyền nhắn tin trong liên hệ này");
            }
            if (contact.getUser() == null && matchesEmail) {
                contact.setUser(user);
            }
        }

        String message = request.reply().trim();
        addMessage(contact, senderRole, message);
        if (admin) {
            contact.setAdminReply(message);
        }
        return contactMapper.toResponse(contactRepository.save(contact));
    }

    private void addMessage(Contact contact, String senderRole, String message) {
        ContactMessage contactMessage = new ContactMessage();
        contactMessage.setContact(contact);
        contactMessage.setSenderRole(senderRole);
        contactMessage.setMessage(message);
        contactMessage.setCreatedAt(LocalDateTime.now());
        contact.getMessages().add(contactMessage);
    }

    @Override
    public void delete(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy liên hệ với id: " + id));
        if (contact.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Liên hệ không tồn tại trong danh sách đang hoạt động: " + id);
        }
        contact.setDeletedAt(LocalDateTime.now());
        contactRepository.save(contact);
    }

    @Override
    public void restore(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy liên hệ trong thùng rác với id: " + id));
        if (contact.getDeletedAt() == null) {
            throw new ResourceNotFoundException("Liên hệ không tồn tại trong thùng rác với id: " + id);
        }
        contact.setDeletedAt(null);
        contactRepository.save(contact);
    }

    @Override
    public void forceDelete(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy liên hệ trong thùng rác với id: " + id));
        if (contact.getDeletedAt() == null) {
            throw new ResourceNotFoundException("Chỉ có thể xóa vĩnh viễn liên hệ trong thùng rác: " + id);
        }
        contactRepository.delete(contact);
    }
}
