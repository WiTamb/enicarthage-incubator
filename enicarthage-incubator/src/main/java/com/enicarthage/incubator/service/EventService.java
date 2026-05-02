package com.enicarthage.incubator.service;

import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.Event;
import com.enicarthage.incubator.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final FileStorageService fileStorageService;

    public List<Event> getPublishedEvents() {
        return eventRepository.findByPublishedOrderByEventDateDesc(true);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Événement introuvable : " + id));
    }

    public Event createEvent(Event event, MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            String imagePath = fileStorageService.store(image, "events");
            event.setImagePath(imagePath);
        }
        log.info("Création d'un nouvel événement : {}", event.getTitle());
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event updatedData, MultipartFile image) {
        Event event = getEventById(id);
        event.setTitle(updatedData.getTitle());
        event.setDescription(updatedData.getDescription());
        event.setLocation(updatedData.getLocation());
        event.setEventDate(updatedData.getEventDate());
        event.setVideoUrl(updatedData.getVideoUrl());
        event.setPublished(updatedData.isPublished());
        event.setRegistrationEnabled(updatedData.isRegistrationEnabled());
        event.setMaxParticipants(updatedData.getMaxParticipants());

        if (image != null && !image.isEmpty()) {
            String imagePath = fileStorageService.store(image, "events");
            event.setImagePath(imagePath);
        }

        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        log.info("Suppression de l'événement id : {}", id);
        eventRepository.deleteById(id);
    }
}
