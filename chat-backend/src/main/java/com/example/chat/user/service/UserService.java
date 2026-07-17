package com.example.chat.user.service;

import com.example.chat.user.dto.UserRequest;
import com.example.chat.user.dto.UserResponse;
import org.apache.catalina.User;

import java.util.List;

public interface UserService {

    UserResponse save(UserRequest request);

    UserResponse findById(Long id);

    List<UserResponse> findAll();
    UserResponse findByUsername(String username);
        List<UserResponse> search(String username);
}
