package com.enicarthage.incubator.repository;

import com.enicarthage.incubator.model.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    List<News> findByPublishedOrderByCreatedAtDesc(boolean published);
    List<News> findByCategoryIgnoreCase(String category);
    List<News> findByTitleContainingIgnoreCase(String keyword);
}
