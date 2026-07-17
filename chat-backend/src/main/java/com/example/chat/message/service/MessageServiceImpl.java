package com.example.chat.message.service;

import com.example.chat.exception.ResourceNotFoundException;
import com.example.chat.message.dto.ChatMessageRequest;
import com.example.chat.message.dto.ChatMessageResponse;
import com.example.chat.message.dto.MessageResponse;
import com.example.chat.message.entity.MessageEntity;
import com.example.chat.message.enums.MessageStatus;
import com.example.chat.message.enums.MessageType;
import com.example.chat.message.mapper.MessageMapper;
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
                            new ResourceNotFoundException(
                                    "Mensaje al que respondes no encontrado."
                            )
                    );
        }

        // El archivo ya fue subido antes por HTTP (POST /api/messages/upload).
        // Aquí solo llega la referencia (fileUrl), no el binario.
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
                                new ResourceNotFoundException(
                                        "Mensaje no encontrado."
                                )
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
    public void updateStatus(
            Long senderId,
            Long recipientId,
            MessageStatus status
    ) {


        int updated =
                messageRepository.updateStatus(
                        senderId,
                        recipientId,
                        status
                );


        System.out.println(
                "MENSAJES ACTUALIZADOS: " + updated
        );



        List<MessageEntity> messages =
                messageRepository.findConversation(
                        senderId,
                        recipientId
                );



        messages.forEach(message -> {


            ChatMessageResponse response =
                    mapper.toChatResponse(message);



            messagingTemplate.convertAndSend(
                    "/topic/messages",
                    response
            );


        });

    }

}