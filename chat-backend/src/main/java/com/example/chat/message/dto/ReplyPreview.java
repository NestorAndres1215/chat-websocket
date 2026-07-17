package com.example.chat.message.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReplyPreview {

    private Long id;

    private String username;

    private String content;

    private String fileUrl;

    private String fileName;

    private String type;

}