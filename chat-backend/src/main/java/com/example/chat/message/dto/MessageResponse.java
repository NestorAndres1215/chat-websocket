package com.example.chat.message.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MessageResponse {

    private Long id;

    private Long userId;

    private String username;

    private String fullName;

    private Long recipientId;

    private String content;

    private String fileUrl;

    private String fileName;

    private String type;

    private String status;

    private LocalDateTime sentAt;

    private ReplyPreview replyTo;

}