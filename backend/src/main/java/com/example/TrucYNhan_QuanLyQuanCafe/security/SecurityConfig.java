package com.example.TrucYNhan_QuanLyQuanCafe.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final DatabaseUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.security.type:basic}")
    private String securityType;

    public SecurityConfig(DatabaseUserDetailsService userDetailsService,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Tắt CSRF cho cả hai bản
        http.csrf(AbstractHttpConfigurer::disable);

        // Cấu hình phân quyền API
        http.authorizeHttpRequests(auth -> auth
                // Đăng ký tài khoản không cần auth (B02)
                .requestMatchers(HttpMethod.POST, "/api/users/register").permitAll()
                // Đăng nhập JWT không cần auth (J02)
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                // Xem danh sách sản phẩm không cần auth 
                .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                // Xem danh sách danh mục không cần auth
                .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**").permitAll()
                // Logout endpoint
                .requestMatchers(HttpMethod.POST, "/api/users/logout", "/api/auth/logout").permitAll()
                // Chỉ ADMIN mới có quyền tạo danh mục 
                .requestMatchers(HttpMethod.POST, "/api/categories", "/api/categories/**").hasRole("ADMIN")
                // Chỉ ADMIN mới có quyền tạo sản phẩm 
                .requestMatchers(HttpMethod.POST, "/api/products", "/api/products/**").hasRole("ADMIN")
                // Xem danh sách người dùng yêu cầu quyền USER hoặc ADMIN )
                .requestMatchers(HttpMethod.GET, "/api/users", "/api/users/**").hasAnyRole("USER", "ADMIN")
                // Mọi request còn lại yêu cầu xác thực
                .anyRequest().authenticated()
        );

        // Gắn AuthenticationProvider
        http.authenticationProvider(authenticationProvider());

        if ("jwt".equalsIgnoreCase(securityType)) {
            // Tắt HTTP Basic, form login, đặt session là STATELESS, thêm JwtAuthenticationFilter
            http.httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        } else {
            //Bật HTTP Basic, không khai báo STATELESS (dùng session mặc định)
            http.httpBasic(Customizer.withDefaults())
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED));
        }

        return http.build();
    }
}
