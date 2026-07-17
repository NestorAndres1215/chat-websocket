package com.example.chat.group.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class GroupCreateRequest {

    private String name;

    private Long createdBy;

    private List<Long> memberIds;

}