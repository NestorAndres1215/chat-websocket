package com.example.chat.message.mapper;

import com.example.chat.message.dto.ChatMessageResponse;
import com.example.chat.message.dto.MessageResponse;
import com.example.chat.message.dto.ReplyPreview;
import com.example.chat.message.entity.MessageEntity;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {


    public ChatMessageResponse toChatResponse(MessageEntity entity) {

        return ChatMessageResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .username(entity.getUser().getUsername())
                .fullName(entity.getUser().getFullName())
                .recipientId(entity.getRecipient().getId())
                .content(entity.getContent())

                .fileUrl(entity.getFileUrl())
                .fileName(entity.getFileName())
                .fileSize(entity.getFileSize())
                .type(entity.getType().name())

                .status(entity.getStatus().name())
                .sentAt(entity.getSentAt())
                .replyTo(toReplyPreview(entity.getReplyTo()))

                .edited(entity.getEdited())
                .editedAt(entity.getEditedAt())
                .deleted(entity.getDeleted())
                .build();

    }



    public MessageResponse toResponse(MessageEntity entity) {

        return MessageResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .username(entity.getUser().getUsername())
                .fullName(entity.getUser().getFullName())
                .recipientId(entity.getRecipient().getId())
                .content(entity.getContent())

                .fileUrl(entity.getFileUrl())
                .fileName(entity.getFileName())
                .fileSize(entity.getFileSize())
                .type(entity.getType().name())

                .status(entity.getStatus().name())
                .sentAt(entity.getSentAt())
                .replyTo(toReplyPreview(entity.getReplyTo()))

                .edited(entity.getEdited())
                .editedAt(entity.getEditedAt())
                .deleted(entity.getDeleted())
                .build();

    }


    private ReplyPreview toReplyPreview(MessageEntity replyTo) {

        if (replyTo == null) {
            return null;
        }

        return ReplyPreview.builder()
                .id(replyTo.getId())
                .username(replyTo.getUser().getUsername())
                .content(replyTo.getContent())
                .fileUrl(replyTo.getFileUrl())
                .fileName(replyTo.getFileName())
                .type(replyTo.getType() != null ? replyTo.getType().name() : null)
                .build();

    }
}