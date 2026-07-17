package com.example.chat.message.service;

import com.example.chat.message.dto.*;
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

    ChatMessageResponse editMessage(Long messageId, EditMessageRequest request);

    ChatMessageResponse deleteMessage(Long messageId, Long userId);
    ChatMessageResponse react(Long messageId, ReactionRequest request);
    ChatMessageResponse togglePin(Long messageId, Long userId);
    List<ChatMessageResponse> getPinned(Long userA, Long userB);
}