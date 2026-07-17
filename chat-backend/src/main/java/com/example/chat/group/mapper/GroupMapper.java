package com.example.chat.group.mapper;

import com.example.chat.group.dto.*;
import com.example.chat.group.entity.GroupEntity;
import com.example.chat.group.entity.GroupMessageEntity;
import com.example.chat.user.mapper.UserMapper;
import org.springframework.stereotype.Component;

@Component
public class GroupMapper {

    private final UserMapper userMapper;

    public GroupMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public GroupResponse toResponse(GroupEntity entity) {

        return GroupResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .createdAt(entity.getCreatedAt())
                .members(entity.getMembers().stream().map(userMapper::toResponse).toList())
                .build();

    }

    public GroupMessageResponse toMessageResponse(GroupMessageEntity entity) {

        return GroupMessageResponse.builder()
                .id(entity.getId())
                .groupId(entity.getGroup().getId())
                .userId(entity.getUser().getId())
                .username(entity.getUser().getUsername())
                .fullName(entity.getUser().getFullName())
                .content(entity.getContent())
                .sentAt(entity.getSentAt())
                .replyTo(toReplyPreview(entity.getReplyTo()))
                .build();

    }

    private GroupReplyPreview toReplyPreview(GroupMessageEntity replyTo) {

        if (replyTo == null) {
            return null;
        }

        return GroupReplyPreview.builder()
                .id(replyTo.getId())
                .username(replyTo.getUser().getUsername())
                .content(replyTo.getContent())
                .build();

    }

}