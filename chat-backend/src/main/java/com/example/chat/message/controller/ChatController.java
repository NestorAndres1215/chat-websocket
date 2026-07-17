package com.example.chat.message.controller;
import com.example.chat.message.dto.ChatMessageRequest;
import com.example.chat.message.dto.ChatMessageResponse;
import com.example.chat.message.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessageResponse send(ChatMessageRequest request) {

        return messageService.send(request);

    }

}