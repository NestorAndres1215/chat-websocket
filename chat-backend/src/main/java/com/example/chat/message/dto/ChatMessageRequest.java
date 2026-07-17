package com.example.chat.message.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ChatMessageRequest {

    private Long userId;

    private Long recipientId;

    private String content;

    private Long replyToId;

    private String fileUrl;

    private String fileName;

    private Long fileSize;

    private String type;



}