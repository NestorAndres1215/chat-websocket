package com.example.chat.message.service;

import com.example.chat.exception.ForbiddenOperationException;
import com.example.chat.exception.ResourceNotFoundException;
import com.example.chat.message.dto.*;
import com.example.chat.message.entity.MessageEntity;
import com.example.chat.message.entity.MessageReactionEntity;
import com.example.chat.message.enums.MessageStatus;
import com.example.chat.message.enums.MessageType;
import com.example.chat.message.mapper.MessageMapper;
import com.example.chat.message.repository.MessageReactionRepository;
import com.example.chat.message.repository.MessageRepository;
import com.example.chat.user.entity.UserEntity;
import com.example.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;



import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {


    private final MessageRepository messageRepository;

    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final MessageMapper mapper;

    private final MessageReactionRepository messageReactionRepository;

    @Override
    @Transactional
    public ChatMessageResponse send(ChatMessageRequest request) {

        UserEntity sender = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario no encontrado.")
                );

        UserEntity recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Destinatario no encontrado.")
                );

        MessageEntity replyTo = null;

        if (request.getReplyToId() != null) {
            replyTo = messageRepository.findById(request.getReplyToId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Mensaje al que respondes no encontrado.")
                    );
        }

        String fileUrl = request.getFileUrl();
        String fileName = request.getFileName();

        MessageType type = (fileUrl != null && !fileUrl.isBlank())
                ? MessageType.FILE
                : MessageType.TEXT;

        MessageEntity entity = MessageEntity.builder()
                .content(request.getContent())
                .fileUrl(fileUrl)
                .fileName(fileName)
                .fileSize(request.getFileSize())
                .type(type)
                .sentAt(LocalDateTime.now())
                .status(MessageStatus.ENVIADO)
                .user(sender)
                .recipient(recipient)
                .replyTo(replyTo)
                .build();
        entity = messageRepository.save(entity);

        ChatMessageResponse response = mapper.toChatResponse(entity);

        messagingTemplate.convertAndSend(
                "/topic/messages",
                response
        );

        return response;
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

        MessageEntity entity =
                messageRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Mensaje no encontrado.")
                        );

        return mapper.toResponse(entity);
    }



    @Transactional(readOnly = true)
    public List<MessageResponse> findConversation(
            Long userA,
            Long userB
    ) {


        return messageRepository.findConversation(userA, userB)
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

    @Override
    @Transactional
    public void updateStatus(Long senderId, Long recipientId, MessageStatus status) {


        int updated = messageRepository.updateStatus(senderId, recipientId, status);

        System.out.println("MENSAJES ACTUALIZADOS: " + updated);

        List<MessageEntity> messages = messageRepository.findConversation(senderId, recipientId);

        messages.forEach(message -> {


            ChatMessageResponse response = mapper.toChatResponse(message);

            messagingTemplate.convertAndSend("/topic/messages", response);

        });
    }


    @Override
    @Transactional
    public ChatMessageResponse editMessage(Long messageId, EditMessageRequest request) {

        MessageEntity message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado."));

        if (!message.getUser().getId().equals(request.getUserId())) {
            throw new ForbiddenOperationException("No puedes editar un mensaje que no es tuyo.");
        }

        if (Boolean.TRUE.equals(message.getDeleted())) {
            throw new IllegalStateException("No puedes editar un mensaje eliminado.");
        }

        message.setContent(request.getContent());
        message.setEdited(true);
        message.setEditedAt(LocalDateTime.now());

        MessageEntity saved = messageRepository.save(message);

        ChatMessageResponse response = mapper.toChatResponse(saved);

        messagingTemplate.convertAndSend("/topic/messages", response);

        return response;
    }

    @Override
    @Transactional
    public ChatMessageResponse deleteMessage(Long messageId, Long userId) {

        MessageEntity message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado."));

        if (!message.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("No puedes eliminar un mensaje que no es tuyo.");
        }

        message.setDeleted(true);
        message.setContent(null);
        message.setFileUrl(null);
        message.setFileName(null);
        message.setFileSize(null);

        MessageEntity saved = messageRepository.save(message);

        ChatMessageResponse response = mapper.toChatResponse(saved);

        messagingTemplate.convertAndSend("/topic/messages", response);

        return response;
    }


    @Override
    @Transactional
    public ChatMessageResponse react(Long messageId, ReactionRequest request) {

        MessageEntity message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado."));

        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        var existing = messageReactionRepository.findByMessageIdAndUserId(messageId, request.getUserId());

        if (existing.isPresent() && existing.get().getEmoji().equals(request.getEmoji())) {
            // Mismo emoji que ya tenía -> quitar reacción (toggle off)
            messageReactionRepository.delete(existing.get());
        } else if (existing.isPresent()) {
            // Emoji distinto -> reemplazar
            existing.get().setEmoji(request.getEmoji());
            messageReactionRepository.save(existing.get());
        } else {
            // Nueva reacción
            MessageReactionEntity reaction = MessageReactionEntity.builder()
                    .message(message)
                    .user(user)
                    .emoji(request.getEmoji())
                    .build();
            messageReactionRepository.save(reaction);
        }

        ChatMessageResponse response = mapper.toChatResponse(message);

        messagingTemplate.convertAndSend("/topic/messages", response);

        return response;
    }

    @Override
    @Transactional
    public ChatMessageResponse togglePin(Long messageId, Long userId) {

        MessageEntity message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado."));

        boolean newValue = !Boolean.TRUE.equals(message.getPinned());

        message.setPinned(newValue);
        message.setPinnedAt(newValue ? LocalDateTime.now() : null);

        messageRepository.save(message);

        ChatMessageResponse response = mapper.toChatResponse(message);

        // avisamos por websocket para que se actualice en tiempo real en ambos lados
        messagingTemplate.convertAndSend("/topic/messages", response);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getPinned(Long userA, Long userB) {
        return messageRepository.findPinnedByConversation(userA, userB)
                .stream()
                .map(mapper::toChatResponse)
                .toList();
    }
}