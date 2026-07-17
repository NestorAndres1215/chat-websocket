package com.example.chat.message.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EditMessageRequest {

    private Long userId;

    private String content;

}