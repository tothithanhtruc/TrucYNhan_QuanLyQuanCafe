
package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngredientRepository
        extends JpaRepository<Ingredient, Long> {
}
