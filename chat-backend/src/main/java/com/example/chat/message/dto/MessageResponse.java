package com.example.chat.message.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MessageResponse {

    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private String status;
    private Long recipientId;
    private LocalDateTime sentAt;
    private String content;

    private String fileUrl;
    private String fileName;
    private Long fileSize;   // <- Debe existir
    private String type;

    private ReplyPreview replyTo;

    private Boolean edited;
    private LocalDateTime editedAt;
    private Boolean deleted;
    private List<ReactionSummary> reactions;

    private Boolean pinned;
    private LocalDateTime pinnedAt;
}