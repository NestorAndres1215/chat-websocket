package com.example.chat.message.repository;

import com.example.chat.message.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<MessageEntity, Long> {

    List<MessageEntity> findAllByOrderBySentAtAsc();

    List<MessageEntity> findByUserId(Long userId);

    @Query("""
        SELECT m FROM MessageEntity m
        WHERE (m.user.id = :userA AND m.recipient.id = :userB)
           OR (m.user.id = :userB AND m.recipient.id = :userA)
        ORDER BY m.sentAt ASC
        """)
    List<MessageEntity> findConversation(@Param("userA") Long userA, @Param("userB") Long userB);

}