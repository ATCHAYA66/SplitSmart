package com.splitwise.repository;

import com.splitwise.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByGroupIdOrderByCreatedAtDesc(Long groupId);
    List<Expense> findByPaidById(Long id);

    @Query("SELECT DISTINCT e FROM Expense e JOIN e.splits s WHERE e.group.id = :groupId OR s.user.id = :userId ORDER BY e.createdAt DESC")
    List<Expense> findByGroupIdOrSplitUserId(@Param("groupId") Long groupId, @Param("userId") Long userId);
}
