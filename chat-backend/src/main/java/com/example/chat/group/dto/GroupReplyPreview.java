package com.example.chat.group.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GroupReplyPreview {

    private Long id;

    private String username;

    private String content;

}