package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactMessageResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Contact;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ContactMapper {

    public Contact toEntity(ContactRequest request) {
        if (request == null) {
            return null;
        }

        Contact contact = new Contact();
        contact.setName(request.name());
        contact.setEmail(request.email());
        contact.setPhone(request.phone());
        contact.setSubject(request.subject());
        contact.setMessage(request.message());
        contact.setStatus(request.status() != null ? request.status() : 1);

        return contact;
    }

    public ContactResponse toResponse(Contact contact) {
        if (contact == null) {
            return null;
        }

        List<ContactMessageResponse> messages = contact.getMessages().stream()
                .map(message -> new ContactMessageResponse(
                        message.getId(),
                        message.getSenderRole(),
                        message.getMessage(),
                        message.getCreatedAt()))
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
        if (messages.isEmpty() && contact.getAdminReply() != null && !contact.getAdminReply().isBlank()) {
            messages.add(new ContactMessageResponse(
                    null,
                    "ADMIN",
                    contact.getAdminReply(),
                    contact.getUpdatedAt()));
        }

        return new ContactResponse(
                contact.getId(),
                contact.getName(),
                contact.getEmail(),
                contact.getPhone(),
                contact.getSubject(),
                contact.getMessage(),
                contact.getStatus(),
                contact.getCreatedAt(),
                contact.getUpdatedAt(),
                contact.getDeletedAt(),
                contact.getAdminReply(),
                messages
        );
    }
}
