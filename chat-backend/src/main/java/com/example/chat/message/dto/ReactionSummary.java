package com.example.chat.message.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReactionSummary {

    private String emoji;

    private long count;

    private boolean reactedByMe; // relativo a quien pide el mensaje; lo resolvemos en frontend

    private java.util.List<Long> userIds;

}