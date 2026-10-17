package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.TableRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.TableResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.TableEntity;
import org.springframework.stereotype.Component;

@Component
public class TableMapper {

    public TableEntity toEntity(TableRequest request) {
        if (request == null) return null;

        TableEntity table = new TableEntity();
        table.setTableName(request.tableName());
        table.setCapacity(request.capacity() != null ? request.capacity() : 4);
        table.setArea(request.area());
        table.setStatus(request.status() != null ? request.status() : "AVAILABLE");
        return table;
    }

    public TableResponse toResponse(TableEntity table) {
        if (table == null) return null;

        return new TableResponse(
                table.getId(),
                table.getTableName(),
                table.getCapacity(),
                table.getArea(),
                table.getStatus(),
                table.getCreatedAt(),
                table.getUpdatedAt()
        );
    }
}
