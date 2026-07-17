package com.example.chat.message.service;

import com.example.chat.exception.ResourceNotFoundException;
import com.example.chat.message.dto.ChatMessageRequest;
import com.example.chat.message.dto.ChatMessageResponse;
import com.example.chat.message.dto.MessageResponse;
import com.example.chat.message.entity.MessageEntity;
import com.example.chat.message.mapper.MessageMapper;
import com.example.chat.message.repository.MessageRepository;
import com.example.chat.user.entity.UserEntity;
import com.example.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    private final UserRepository userRepository;

    private final MessageMapper mapper;

    @Override
    @Transactional
    public ChatMessageResponse send(ChatMessageRequest request) {

        UserEntity sender = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario no encontrado."));

        UserEntity recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Destinatario no encontrado."));

        MessageEntity replyTo = null;

        if (request.getReplyToId() != null) {
            replyTo = messageRepository.findById(request.getReplyToId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Mensaje al que respondes no encontrado."));
        }

        MessageEntity entity = MessageEntity.builder()
                .content(request.getContent())
                .sentAt(LocalDateTime.now())
                .user(sender)
                .recipient(recipient)
                .replyTo(replyTo)
                .build();

        entity = messageRepository.save(entity);

        return mapper.toChatResponse(entity);

    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> findAll() {

        return messageRepository.findAllByOrderBySentAtAsc()
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

    @Override
    @Transactional(readOnly = true)
    public MessageResponse findById(Long id) {

        MessageEntity entity = messageRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Mensaje no encontrado."));

        return mapper.toResponse(entity);

    }

    @Transactional(readOnly = true)
    public List<MessageResponse> findConversation(Long userA, Long userB) {

        return messageRepository.findConversation(userA, userB)
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

}