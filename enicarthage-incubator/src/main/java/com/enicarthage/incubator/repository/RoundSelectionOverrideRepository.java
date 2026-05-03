package com.enicarthage.incubator.repository;

import com.enicarthage.incubator.model.RoundSelectionOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoundSelectionOverrideRepository extends JpaRepository<RoundSelectionOverride, Long> {
    List<RoundSelectionOverride> findByRoundId(Long roundId);
    Optional<RoundSelectionOverride> findByRoundIdAndApplicationId(Long roundId, Long applicationId);
}
