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
                .requestMatchers(HttpMethod.POST, "/api/orders/checkout").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/orders").hasRole("ADMIN")
                // Xem danh sách sản phẩm không cần auth 
                .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                // Xem danh sách danh mục không cần auth
                .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**").permitAll()
                // Xem danh sách bài viết không cần auth
                .requestMatchers(HttpMethod.GET, "/api/posts", "/api/posts/**").permitAll()
                // Xem danh sách banner không cần auth
                .requestMatchers(HttpMethod.GET, "/api/banners", "/api/banners/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/uploads/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/uploads/image").hasRole("ADMIN")
                // Gửi liên hệ không cần auth
                .requestMatchers(HttpMethod.POST, "/api/contacts", "/api/contacts/**").permitAll()
                // Các endpoint thùng rác cần xác thực, kể cả khi chạy sau proxy
                .requestMatchers(HttpMethod.GET, "/api/contacts/inbox").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/contacts/trash").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/contacts/*/restore").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/contacts/*/force-delete").authenticated()
                // Xem và quản lý liên hệ yêu cầu đăng nhập
                .requestMatchers(HttpMethod.GET, "/api/contacts", "/api/contacts/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/contacts/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/contacts/**").authenticated()
                // Logout endpoint
                .requestMatchers(HttpMethod.POST, "/api/users/logout", "/api/auth/logout").permitAll()
                // Chỉ ADMIN mới có quyền tạo danh mục 
                .requestMatchers(HttpMethod.POST, "/api/categories", "/api/categories/**").hasRole("ADMIN")
                // Chỉ ADMIN mới có quyền tạo sản phẩm 
                .requestMatchers(HttpMethod.POST, "/api/products", "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/posts", "/api/posts/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/topics", "/api/topics/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/categories/**", "/api/posts/**", "/api/topics/**", "/api/tables/**", "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/products/**", "/api/categories/**", "/api/posts/**", "/api/topics/**", "/api/tables/**", "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/categories/**", "/api/posts/**", "/api/topics/**", "/api/tables/**", "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/users", "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/orders", "/api/orders/**", "/api/tables", "/api/tables/**").hasRole("ADMIN")
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
