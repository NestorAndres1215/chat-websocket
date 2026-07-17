package com.example.chat.message.repository;

import com.example.chat.message.entity.MessageEntity;
import com.example.chat.message.enums.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

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
    List<MessageEntity> findConversation(
            @Param("userA") Long userA,
            @Param("userB") Long userB
    );


    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("""
UPDATE MessageEntity m
SET m.status = :status
WHERE m.user.id = :senderId
AND m.recipient.id = :recipientId
AND m.status <> :status
""")
    int updateStatus(
            @Param("senderId") Long senderId,
            @Param("recipientId") Long recipientId,
            @Param("status") MessageStatus status
    );

    @Query("""
    SELECT m FROM MessageEntity m
    WHERE m.pinned = true
    AND ((m.user.id = :userA AND m.recipient.id = :userB)
      OR (m.user.id = :userB AND m.recipient.id = :userA))
    ORDER BY m.pinnedAt DESC
""")
    List<MessageEntity> findPinnedByConversation(@Param("userA") Long userA, @Param("userB") Long userB);
}