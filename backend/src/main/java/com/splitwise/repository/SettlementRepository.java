package com.splitwise.repository;

import com.splitwise.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    List<Settlement> findByGroupIdOrderBySettledAtDesc(Long groupId);

    @Query("SELECT s FROM Settlement s WHERE s.payer.id = :userId OR s.payee.id = :userId ORDER BY s.settledAt DESC")
    List<Settlement> findByPayerIdOrPayeeId(@Param("userId") Long userId);
}
