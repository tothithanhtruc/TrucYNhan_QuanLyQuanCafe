package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.ContactResponse;

import java.util.List;

public interface ContactService {

    List<ContactResponse> getAll();

    ContactResponse getById(Long id);

    ContactResponse create(ContactRequest request);

    ContactResponse update(Long id, ContactRequest request);

    void delete(Long id);
}
