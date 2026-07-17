package com.example.chat.message.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequest {

    private Long userId;

    private Long recipientId;

    private String content;

    private Long replyToId;

}