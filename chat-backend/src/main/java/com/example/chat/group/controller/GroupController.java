package com.example.chat.group.controller;

import com.example.chat.group.dto.GroupCreateRequest;
import com.example.chat.group.dto.GroupMessageResponse;
import com.example.chat.group.dto.GroupResponse;
import com.example.chat.group.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public GroupResponse create(@RequestBody GroupCreateRequest request) {

        return groupService.create(request);

    }

    @GetMapping
    public List<GroupResponse> findByUser(@RequestParam Long userId) {

        return groupService.findByUser(userId);

    }

    @GetMapping("/{groupId}/messages")
    public List<GroupMessageResponse> history(@PathVariable Long groupId) {

        return groupService.history(groupId);

    }

}