package com.example.chat.group.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class GroupMessageResponse {

    private Long id;

    private Long groupId;

    private Long userId;

    private String username;

    private String fullName;

    private String content;

    private LocalDateTime sentAt;

    private GroupReplyPreview replyTo;

}