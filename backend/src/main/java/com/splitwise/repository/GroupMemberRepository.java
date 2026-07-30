package com.splitwise.repository;

import com.splitwise.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByUserId(Long userId);
    List<GroupMember> findByGroupId(Long groupId);
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.group g WHERE gm.user.id = :userId")
    List<GroupMember> findAllGroupsByUserIdFetchGroup(@Param("userId") Long userId);

    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.user u WHERE gm.group.id = :groupId")
    List<GroupMember> findAllMembersByGroupIdFetchUser(@Param("groupId") Long groupId);
}
