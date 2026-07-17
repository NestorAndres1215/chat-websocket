package com.example.chat.message.repository;

import com.example.chat.message.entity.MessageReactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageReactionRepository extends JpaRepository<MessageReactionEntity, Long> {

    List<MessageReactionEntity> findByMessageId(Long messageId);

    Optional<MessageReactionEntity> findByMessageIdAndUserId(Long messageId, Long userId);

    void deleteByMessageIdAndUserId(Long messageId, Long userId);

}