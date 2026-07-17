package com.example.chat.message.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {

    private Long id;

    private Long userId;

    private String username;

    private String fullName;

    private Long recipientId;

    private LocalDateTime sentAt;

    private String content;

    private ReplyPreview replyTo;

}