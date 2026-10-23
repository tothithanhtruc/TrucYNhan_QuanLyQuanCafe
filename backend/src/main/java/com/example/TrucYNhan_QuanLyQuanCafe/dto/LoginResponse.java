package com.example.TrucYNhan_QuanLyQuanCafe.dto;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresIn
) {
    public LoginResponse(String token, long expiresIn) {
        this(token, "Bearer", expiresIn);
    }
}
