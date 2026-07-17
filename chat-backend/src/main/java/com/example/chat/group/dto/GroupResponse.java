package com.example.chat.group.dto;

import com.example.chat.user.dto.UserResponse;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class GroupResponse {

    private Long id;

    private String name;

    private LocalDateTime createdAt;

    private List<UserResponse> members;

}