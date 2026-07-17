package com.example.chat.message.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReactionRequest {

    private Long userId;

    private String emoji;

}