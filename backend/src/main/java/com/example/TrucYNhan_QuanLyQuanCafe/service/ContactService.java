package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactReplyRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactResponse;

import java.util.List;

public interface ContactService {

    List<ContactResponse> getAll();

    List<ContactResponse> getTrash();

    List<ContactResponse> getInbox(String username);

    ContactResponse getById(Long id);

    ContactResponse create(ContactRequest request, String username);

    ContactResponse update(Long id, ContactRequest request);

    ContactResponse reply(Long id, ContactReplyRequest request);

    ContactResponse sendMessage(Long id, ContactReplyRequest request, String username, boolean admin);

    void delete(Long id);

    void restore(Long id);

    void forceDelete(Long id);
}
