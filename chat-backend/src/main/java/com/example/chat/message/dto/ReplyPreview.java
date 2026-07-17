package com.example.chat.message.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReplyPreview {

    private Long id;

    private String username;

    private String content;

}