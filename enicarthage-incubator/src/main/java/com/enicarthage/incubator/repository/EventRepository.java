package com.enicarthage.incubator.repository;

import com.enicarthage.incubator.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByPublishedOrderByEventDateDesc(boolean published);
    List<Event> findByTitleContainingIgnoreCase(String keyword);
}
