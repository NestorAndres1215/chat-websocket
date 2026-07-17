package com.example.chat.user.mapper;

import com.example.chat.user.dto.UserRequest;
import com.example.chat.user.dto.UserResponse;
import com.example.chat.user.entity.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserEntity toEntity(UserRequest request) {

        return UserEntity.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .connected(false)
                .build();

    }

    public UserResponse toResponse(UserEntity entity) {

        return UserResponse.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .fullName(entity.getFullName())
                .connected(entity.getConnected())
                .build();

    }

}