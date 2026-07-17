package com.example.chat.message.controller;

import com.example.chat.message.dto.ChatMessageResponse;
import com.example.chat.message.dto.EditMessageRequest;
import com.example.chat.message.dto.MessageResponse;
import com.example.chat.message.entity.MessageEntity;
import com.example.chat.message.enums.MessageStatus;
import com.example.chat.message.mapper.MessageMapper;
import com.example.chat.message.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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

    @PutMapping("/status")
    public void updateStatus(
            @RequestParam Long senderId,
            @RequestParam Long recipientId,
            @RequestParam MessageStatus status
    ) {

        messageService.updateStatus(senderId, recipientId, status);

    }


    @PutMapping("/{id}")
    public ResponseEntity<ChatMessageResponse> edit(
            @PathVariable Long id,
            @RequestBody EditMessageRequest request
    ) {
        return ResponseEntity.ok(messageService.editMessage(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ChatMessageResponse> delete(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(messageService.deleteMessage(id, userId));
    }

}