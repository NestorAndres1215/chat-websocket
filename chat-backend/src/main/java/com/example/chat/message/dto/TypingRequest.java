package com.example.chat.message.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TypingRequest {

    private Long senderId;

    private Long receiverId;

    private boolean typing;

}