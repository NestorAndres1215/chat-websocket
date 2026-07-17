package com.example.chat.group.service;

import com.example.chat.group.dto.*;

import java.util.List;

public interface GroupService {

    GroupResponse create(GroupCreateRequest request);

    List<GroupResponse> findByUser(Long userId);

    GroupMessageResponse send(GroupMessageRequest request);

    List<GroupMessageResponse> history(Long groupId);

}