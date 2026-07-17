package com.example.chat.group.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupMessageRequest {

    private Long groupId;

    private Long userId;

    private String content;

    private Long replyToId;

}