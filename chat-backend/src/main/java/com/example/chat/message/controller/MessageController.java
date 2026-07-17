package com.example.chat.message.controller;

import com.example.chat.message.dto.MessageResponse;
import com.example.chat.message.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public List<MessageResponse> findAll() {

        return messageService.findAll();

    }

    @GetMapping("/{id}")
    public MessageResponse findById(@PathVariable Long id) {

        return messageService.findById(id);

    }

    @GetMapping("/conversation")
    public List<MessageResponse> findConversation(
            @RequestParam Long userA,
            @RequestParam Long userB) {

        return messageService.findConversation(userA, userB);

    }

}