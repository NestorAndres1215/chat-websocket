package com.example.chat.message.service;

import com.example.chat.message.dto.ChatMessageRequest;
import com.example.chat.message.dto.ChatMessageResponse;
import com.example.chat.message.dto.MessageResponse;
import com.example.chat.message.enums.MessageStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MessageService {

    ChatMessageResponse send(
            ChatMessageRequest request

    );

    List<MessageResponse> findAll();

    MessageResponse findById(Long id);
    List<MessageResponse> findConversation(Long userA, Long userB);
    void updateStatus(Long senderId, Long recipientId, MessageStatus status);

}