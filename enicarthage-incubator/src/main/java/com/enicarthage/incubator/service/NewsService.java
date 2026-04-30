package com.enicarthage.incubator.service;

import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.News;
import com.enicarthage.incubator.model.User;
import com.enicarthage.incubator.repository.NewsRepository;
import com.enicarthage.incubator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public List<News> getPublishedNews() {
        return newsRepository.findByPublishedOrderByCreatedAtDesc(true);
    }

    public List<News> getAllNews() {
        return newsRepository.findAll();
    }

    public News getNewsById(Long id) {
        return newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Actualité introuvable : " + id));
    }

    public News createNews(News news, MultipartFile image, String authorEmail) {
        User author = userRepository.findByEmail(authorEmail).orElse(null);
        news.setAuthor(author);

        if (image != null && !image.isEmpty()) {
            String imagePath = fileStorageService.store(image, "news");
            news.setImagePath(imagePath);
        }

        return newsRepository.save(news);
    }

    public News updateNews(Long id, News updatedData, MultipartFile image) {
        News news = getNewsById(id);
        news.setTitle(updatedData.getTitle());
        news.setContent(updatedData.getContent());
        news.setCategory(updatedData.getCategory());
        news.setPublished(updatedData.isPublished());

        if (image != null && !image.isEmpty()) {
            String imagePath = fileStorageService.store(image, "news");
            news.setImagePath(imagePath);
        }

        return newsRepository.save(news);
    }

    public void deleteNews(Long id) {
        newsRepository.deleteById(id);
    }
}
