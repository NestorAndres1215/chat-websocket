package com.example.chat.message.controller;

import com.example.chat.message.dto.ChatMessageRequest;
import com.example.chat.message.dto.ChatMessageResponse;
import com.example.chat.message.dto.TypingRequest;
import com.example.chat.message.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat")
    public void send(@Payload ChatMessageRequest request) {
        ChatMessageResponse response = messageService.send(request);
        messagingTemplate.convertAndSend("/topic/messages", response);
    }

    @MessageMapping("/typing")
    public void typing(TypingRequest request) {

        messagingTemplate.convertAndSend(
                "/topic/typing",
                request
        );

    }

}