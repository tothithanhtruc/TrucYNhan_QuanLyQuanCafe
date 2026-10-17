package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.TableRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.TableResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.TableEntity;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.TableMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.TableRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.TableService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TableServiceImpl implements TableService {

    private final TableRepository tableRepository;
    private final TableMapper tableMapper;

    public TableServiceImpl(TableRepository tableRepository, TableMapper tableMapper) {
        this.tableRepository = tableRepository;
        this.tableMapper = tableMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getAll() {
        return tableRepository.findAll()
                .stream()
                .map(tableMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getById(Long id) {
        return tableRepository.findById(id)
                .map(tableMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với id: " + id));
    }

    @Override
    public TableResponse create(TableRequest request) {
        TableEntity table = tableMapper.toEntity(request);
        return tableMapper.toResponse(tableRepository.save(table));
    }

    @Override
    public TableResponse update(Long id, TableRequest request) {
        TableEntity existing = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với id: " + id));

        existing.setTableName(request.tableName());
        if (request.capacity() != null) existing.setCapacity(request.capacity());
        existing.setArea(request.area());
        if (request.status() != null) existing.setStatus(request.status());

        return tableMapper.toResponse(tableRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!tableRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy bàn với id: " + id);
        }
        tableRepository.deleteById(id);
    }
}
