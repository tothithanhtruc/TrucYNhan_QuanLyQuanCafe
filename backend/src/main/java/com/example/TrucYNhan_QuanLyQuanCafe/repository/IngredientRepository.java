
package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngredientRepository
        extends JpaRepository<Ingredient, Long> {
    List<Ingredient> findByDeletedAtIsNullOrderByCreatedAtDescIdDesc();

    List<Ingredient> findByDeletedAtIsNotNullOrderByDeletedAtDescIdDesc();
}
