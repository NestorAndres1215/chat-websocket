package com.example.chat.message.mapper;

import com.example.chat.message.dto.ChatMessageResponse;
import com.example.chat.message.dto.MessageResponse;
import com.example.chat.message.dto.ReactionSummary;
import com.example.chat.message.dto.ReplyPreview;
import com.example.chat.message.entity.MessageEntity;
import com.example.chat.message.entity.MessageReactionEntity;
import com.example.chat.message.repository.MessageReactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class MessageMapper {

    private final MessageReactionRepository reactionRepository;


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

                .pinned(entity.getPinned())
                .pinnedAt(entity.getPinnedAt())

                .reactions(toReactionSummaries(entity.getId()))
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

                .pinned(entity.getPinned())
                .pinnedAt(entity.getPinnedAt())

                .reactions(toReactionSummaries(entity.getId()))
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



    private List<ReactionSummary> toReactionSummaries(Long messageId) {

        List<MessageReactionEntity> reactions = reactionRepository.findByMessageId(messageId);

        if (reactions.isEmpty()) {
            return List.of();
        }

        Map<String, List<MessageReactionEntity>> grouped = reactions.stream()
                .collect(Collectors.groupingBy(MessageReactionEntity::getEmoji));

        return grouped.entrySet().stream()
                .map(entry -> ReactionSummary.builder()
                        .emoji(entry.getKey())
                        .count(entry.getValue().size())
                        .userIds(entry.getValue().stream()
                                .map(r -> r.getUser().getId())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

    }

}